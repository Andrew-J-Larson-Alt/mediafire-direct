# mediafire-direct
Using a normal Mediafire file download URL, I've created a bash script and website that should automatically redirect to the direct download URL.

## Bash Usage
In the `0-bash-scripts` folder, you'll find 2 scripts. Both should be executed like the following:
- URL: `./[script-name].sh https://www.mediafire.com/file/[download-identifier]/file`
- Download Identifier: `./[script-name].sh [download-identifier]`

The only difference between the scripts are `mediafire-direct.sh` only provides the direct download URL back for you to use on your own, while `mediafire-direct-dl.sh` actually downloads the file you asked for. Just make sure that you at least have either `wget` or `curl` installed for it to work.

## Website Usage
You can either go to the website, [Mediafire Direct Download](https://thealiendrew.github.io/mediafire-direct/), directly and enter the Mediafire link you want to direct download. Or you can prefix any format of the download link, or just use its download identifier like so:

- URL: `https://thealiendrew.github.io/mediafire-direct/?dl=https://www.mediafire.com/file/[download-identifier]/file`
- Download Identifier: `https://thealiendrew.github.io/mediafire-direct/?dl=[download-identifier]`

![Preview](https://github.com/TheAlienDrew/mediafire-direct/blob/main/img/readme/preview.png)
