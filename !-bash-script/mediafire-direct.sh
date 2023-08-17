#!/bin/bash

# Copyright (C) 2023  Andrew Larson (andrew.j.larson18+github+alt@gmail.com)
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

# requires a file downloader to work
command -v wget >/dev/null 2>&1 && wget=0 || wget=1
command -v curl >/dev/null 2>&1 && curl=0 || curl=1
if [ $wget -eq 1 ] && [ $curl -eq 1 ]; then
  echo "Error: this tool requires either \`wget\` or \`curl\` to be installed." >/dev/stderr
  exit 1
fi

# check to make sure we are online
echo -e "GET http://google.com HTTP/1.0\n\n" | nc google.com 80 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Error: this tool requires internet access to work."
  exit 1
fi

# for matching the parameter download URLs
MEDIAFIRE_WEB_DELAY=1.5 # s; Mediafire's specified delay is 1s to redirect to parametered download URLs, and needs another .5s to time things properly
VALID_MEDIAFIRE_PRE_DL="(?<=['\"])(https?:)?(\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[^'\"\?]+\?dkey\=[^'\"]+(?=['\"])"

# for matching the dynamic download URLs
VALID_DYNAMIC_DL="(?<=['\"])https?:\/\/download[0-9]+\.mediafire\.com\/[^'\"]+(?=['\"])"

# get options/arguments
AUTO_DOWNLOAD=0
URLS=() # gets set below
VALIDATED_URLS=()
for i in "$@"; do
  case $i in
    -n|--no-download)
      AUTO_DOWNLOAD=1
      shift
      ;;
    -*|--*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      URLS+=("$i")
      shift
      ;;
  esac
done

for url in "${URLS[@]}"; do
  # need to check if mediafire URL is in correct format
  isIdentifierDL=0
  if [ -z "$url" ]; then
    echo "Error: please enter at least one URL to use this tool." >/dev/stderr
    exit 1
  else
    # need to check what kind of link it is
    urlValidated='!' # '!' can't be in domain name, and is always percent-escaped in path
    urlInvalidated='@' # '@' can't be in domain name, and is always percent-escaped in path

    testUrl="$(echo "$url" | sed 's/'"${urlValidated}"'/'"${urlInvalidated}"'/g')" # must prevent validating string from validating
    if [ $(echo "$testUrl" | sed -E 's/^[a-zA-Z0-9]+$/'"${urlValidated}"'/g') = $urlValidated ]; then
      isIdentifierDL=1
    elif ! ([ $(echo "$testUrl" | sed -E 's/^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/'"${urlValidated}"'/g') = $urlValidated ] ||
         [ $(echo "$url" | sed -E 's/^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_~%\.\-]+)?(\/file)?/'"${urlValidated}"'/g') = $urlValidated ]); then
      # isn't a mediafire url
      echo "Error: \"$url\" isn't a valid mediafire download URL." >/dev/stderr
      exit 1
    fi
  fi

  # if we get here, we may need to fix the url
  if [ $isIdentifierDL -eq 1 ]; then
    # needs url created
    url="https://mediafire.com/?$url"
  elif [ ! -z "$(echo "$url" | grep '^http:\/\/')" ]; then
    # might want need to replace http:// with https://
    url="${url//http:\/\//https:\/\/}"
  elif [ -z "$(echo "$url" | grep '^https:\/\/')" ]; then
    # if the link doesn't have http(s), it needs to be appended
    if [ ! -z "$(echo "$url" | grep '^\/\/')" ]; then
      url="https:$url"
    else
      url="https://$url"
    fi
  fi

  # use wget, otherwise, use curl
  dlPreUrl=""
  dlUrl=""
  if [ $wget -eq 0 ]; then
    dlPreUrl=$(wget -qO - "$url" > /dev/stdout | grep -oP "${VALID_MEDIAFIRE_PRE_DL}" | head -n 1)
    dlUrl=$(wget -qO - "$url" > /dev/stdout | grep -oP "${VALID_DYNAMIC_DL}" | head -n 1)
  elif [ $curl -eq 0 ]; then
    dlPreUrl=$(curl -sL "$url" | grep -oP "${VALID_MEDIAFIRE_PRE_DL}" | head -n 1)
    dlUrl=$(curl -sL "$url" | grep -oP "${VALID_DYNAMIC_DL}" | head -n 1)
  fi

  # check if download parameter link was instead used on website
  if [ ! -z "$dlPreUrl" ]; then
    url="$dlPreUrl"
    # must recheck for correct download URL
    if [ $wget -eq 0 ]; then
      dlUrl=$(wget -qO - "$url" > /dev/stdout | grep -oP "${VALID_DYNAMIC_DL}" | head -n 1)
    elif [ $curl -eq 0 ]; then
      dlUrl=$(curl -sL "$url" | grep -oP "${VALID_DYNAMIC_DL}" | head -n 1)
    fi
    sleep $MEDIAFIRE_WEB_DELAY
  fi # error is handled below

  # only continue if URL has an available download
  if [ -z "$dlUrl" ]; then
    echo "Error: \"$url\" doesn't have an available download, try a different url." >/dev/stderr
    exit 1
  else # save to downloadUrls array
    VALIDATED_URLS+=("$dlUrl")
  fi
done

# either download or show the URLs as per options/arguments
for url in "${VALIDATED_URLS[@]}"; do
  if [ $AUTO_DOWNLOAD -eq 0 ]; then
    if [ $wget -eq 0 ]; then wget "$url"
    elif [ $curl -eq 0 ]; then curl -O -J "$url"; fi
  else
    echo "$url"
  fi
done
