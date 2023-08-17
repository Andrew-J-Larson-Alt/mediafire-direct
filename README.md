# mediafire-direct
Using a normal Mediafire file download URL, I've created a bash script and website that should automatically redirect to the direct download URL.

## NOTE: No longer being updated/hosted... I should have suspected this, but I guess bad actors have been using this to redirect people to malware from my GitHub.io website. Shame, can't have nice things I guess.

## Bash Usage
In the `!-bash-script` folder, you'll find a script which is executed like the following:
- URL: `./mediafire-direct.sh https://www.mediafire.com/file/[download-identifier]/file`
- Download Identifier: `./mediafire-direct.sh [download-identifier]`

By default, the script will download the URL(s) you give it, if you want it to just show the resulting temporary direct links, execute the script like so:
- E.g. `./mediafire-direct.sh -n [download-identifier]` OR `./mediafire-direct.sh --no-download [download-identifier]`

If you want to download more than one file, you just need to add more links onto the end:
- E.g. `./mediafire-direct.sh [download-identifier1] [download-identifier2] [download-identifier3] [download-identifier4]`

The bash script requires `wget` or `curl` to be installed for it to work.

## Website Usage
You can either go to the website, [Mediafire Direct Download](https://andrew-j-larson.github.io/mediafire-direct/), directly and enter the Mediafire link you want to direct download. Or you can prefix any format of the download link, or just use its download identifier like so:

- URL: `https://andrew-j-larson.github.io/mediafire-direct/?dl=https://www.mediafire.com/file/[download-identifier]/file`
- Download Identifier: `https://andrew-j-larson.github.io/mediafire-direct/?dl=[download-identifier]`

![Preview](https://github.com/Andrew-J-Larson-Alt/mediafire-direct/blob/main/img/readme/preview.png)
