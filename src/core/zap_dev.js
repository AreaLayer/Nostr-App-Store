import { getFundingDetails } from "@getalby/pkgzap"
import { fetchFundingInfo } from "@getalby/pkgzap"

const fundingInfo = getFundingDetails()

console.log(JSON.stringify(fundingInfo, null, 2))

const fundingInfo = fetchFundingInfo(packageJsonData)

console.log(JSON.stringify(fundingInfo, null, 2))
