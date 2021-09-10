#!/bin/bash

# Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

command -v wget >/dev/null 2>&1 && wget=1 || wget=0
command -v curl >/dev/null 2>&1 && curl=1 || curl=0

# if we have no tool to use, error
if [ $wget -eq 0 ] && [ $curl -eq 0 ]; then
  echo "Error: this tool requires either \`wget\` or \`curl\` to be installed." >/dev/stderr
  exit 1
fi

# check to make sure we are online
echo -e "GET http://google.com HTTP/1.0\n\n" | nc google.com 80 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Error: this tool requires internet access to work."
  exit 1
fi

urlIsValid='[VALID]'
url="$1"

# need to check if mediafire URL is in correct format
isIdentifierDL=0
if [ -z "$url" ]; then
  echo "Error: please enter in a URL to use this tool." >/dev/stderr
else
  isInitiallyValid=0
  # need to check what kind of link it is
  if [ $url != $urlIsValid ]; then
    if [ $(echo "$url" | sed -E 's/^[a-zA-Z0-9]+$/\[VALID\]/g') = $urlIsValid ]; then
      isInitiallyValid=1
      isIdentifierDL=1
    elif [ $(echo "$url" | sed -E 's/^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/\[VALID\]/g') = $urlIsValid ] ||
         [ $(echo "$url" | sed -E 's/^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_\-\.~%]+)?(\/file)?$/\[VALID\]/g') = $urlIsValid ]; then
      isInitiallyValid=1
    else # we aren't a mediafire url
      echo "Error: please enter a valid mediafire download URL." >/dev/stderr
      exit 1
    fi
  else # string can't match what we use to validate urls
    echo "Error: please enter a valid mediafire download URL." >/dev/stderr
    exit 1
  fi
fi

# functions to parse xml documents
xmlgetnext () {
  local IFS='>'
  read -d '<' TAG VALUE
}
# following functions use first parameter as the URL
wgetParseXML () {
  wget -qO - "$1" > /dev/stdout | while xmlgetnext ; do echo $TAG ; done
}
curlParseXML () {
  curl -sL "$1" | while xmlgetnext ; do echo $TAG ; done
}

# if we get here, we may need to fix the url
if [ $isIdentifierDL -eq 1 ]; then
  # needs url created
  url="https://mediafire.com/?$url"
elif [ ! -z "$(echo "$url" | grep '^http:\/\/')" ]; then
  # might want need to replace http:// with https://
  url="${url//http:\/\//https:\/\/}"
elif [ -z "$(echo "$url" | grep '^https:\/\/')" ]; then
  # needs https:// added on
  url="https://$url"
fi

# use wget, otherwise, use curl
dlUrl=""
if [ $wget -eq 1 ]; then
  dlUrl=$(wgetParseXML "$url" | grep 'id="downloadButton"')
elif [ $curl -eq 1 ]; then
  dlUrl=$(curlParseXML "$url" | grep 'id="downloadButton"')
fi

# now we just need to output the url if there was one on the page
dlUrl=$(echo "$dlUrl" | perl -nle'print $& while m{(?<=href=").*?(?=")}g')
if [ -z "$dlUrl" ]; then
  echo "Error: that Mediafire webpage doesn't have an available download, try a different url." >/dev/stderr
  exit 1
else # download to current location
  if [ $wget -eq 1 ]; then wget "$dlUrl"
  elif [ $curl -eq 1 ]; then curl -O -J "$dlUrl"; fi
fi

