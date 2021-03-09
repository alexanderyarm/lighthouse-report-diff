# First run
Don't forget to run `yarn`

# Usage
## To get reports
`yarn report <url> <outputFolder> [forceFolderCleanup] [numberOfRetries]`

`url: string` - target Url to run lighthouse against
`outputFolder:string` - folder name where to put reports
`forceFolderCleanup:boolean` - clean up output folder, default is false 
`numberOfRetries:number` - number of tests to run, default is 10

Example:
`yarn report <https://www.omio.com/?disable_3rd_party> beforeFolder true 20`

## To compare
`yarn compare <beforeFolder> <afterFolder>`
`beforeFolder:string` - folder name with lighthouse json reports
`afterFolder:string` - folder name with lighthouse json reports


