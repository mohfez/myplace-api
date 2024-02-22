const crypto = require("crypto");
const https = require("https");

const STRATH_URL = "api.is.strath.ac.uk";
const LOGIN_API = { PATH: "/api/service/login/v1/", SERVICE: "LOGIN" };
const LOGOUT_API = { PATH: "/api/service/logout/v1/", SERVICE: "LOGOUT" };
const CHOOSE_ACCOUNT_API = { PATH: "/api/service/chooseaccount/v1/", SERVICE: "CHOOSEACCOUNT" };
const NEW_NOTICES_API = { PATH: "/api/service/myplace_new_notices/v1/", SERVICE: "MYPLACE_NEW_NOTICES" };
const NOTICES_COUNT_API = { PATH: "/api/service/myplace_notices_count/v1/", SERVICE: "MYPLACE_NOTICES_COUNT" };
const SET_ALL_NOTICES_READ_API = { PATH: "/api/service/myplace_set_all_notices_read/v1/", SERVICE: "MYPLACE_SET_ALL_NOTICES_READ" };
const NOTICES_API = { PATH: "/api/service/myplace_notices/v1/", SERVICE: "MYPLACE_NOTICES"};
const DEADLINES_API = { PATH: "/api/service/myplace_cw_deadlines/v1/", SERVICE: "MYPLACE_CW_DEADLINES" };
const CLASS_RESULTS_API = { PATH: "/api/service/class_results/v1/", SERVICE: "CLASS_RESULTS" };
const EXAM_RESULTS_API = { PATH: "/api/service/exam_results/v1/", SERVICE: "EXAM_RESULTS" };
const CLASS_TIMETABLE_API = { PATH: "/api/service/class_timetable/v1/", SERVICE: "CLASS_TIMETABLE" };
const EXAM_TIMETABLE_API = { PATH: "/api/service/exam_timetable/v3/", SERVICE: "EXAM_TIMETABLE" };
const EXAM_PAPERS_API = { PATH: "/api/service/exam_papers/v1/", SERVICE: "EXAM_PAPERS" };
const LAB_PC_AVAILABILITY_API = { PATH: "/api/service/lab_pc_availability/v1/", SERVICE: "LAB_PC_AVAILABILITY" };
const GET_BOOKINGS_API = { PATH: "/api/service/telepen_get_bookings/v1/", SERVICE: "TELEPEN_GET_BOOKINGS" };
const LIBRARY_LOANED_BOOKINGS_API = { PATH: "/api/service/books_on_loan/v1/", SERVICE: "BOOKS_ON_LOAN" };
const CACHE_POLICY_API = { PATH: "/api/service/cache_policy/v1/", SERVICE: "CACHE_POLICY" }
const MYPLACE_CLASSES_API = { PATH: "/api/service/myplace_classes/v1/", SERVICE: "MYPLACE_CLASSES" }
const MOBILE_ACCOUNTS_API = { PATH: "/api/service/mobileaccounts/v1/", SERVICE: "MOBILEACCOUNTS" }
const APP_VERSION = "3.2.2";

/**
 * @param {string} serviceName The API service name.
 * @param {number} timestamp The current timestamp.
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {string} The MAC address of the current instance.
 */
async function GetMAC(serviceName, timestamp, tokenId, deviceId)
{
    tokenId = tokenId || "x";
    deviceId = deviceId || "y";

    const mac = (serviceName.toUpperCase() + tokenId + timestamp).toString();
    let charSum = 0;
    for (let i = 0; i < mac.length; i++) charSum += mac.charCodeAt(i);

    const md5 = crypto.createHash("md5");
    md5.update((charSum + deviceId).toString(), "utf-8");
    return await md5.digest("hex").toUpperCase();
}

/**
 * @returns {number} The current timestamp.
 */
function GetTimestamp()
{
    return ((new Date).getTime() / 1e3);
}

/**
 * Hidden helper function for calling APIs.
 * @param {string} apiPath The path that's connected to the URL.
 * @param {URLSearchParams|JSON} postData Data to send, can be nothing.
 * @param {boolean} jsonContentType Is it JSON?
 * @param {string} tokenId The token id of the account.
 * @param {number} timestamp The current timestamp.
 * @param {string} mac The MAC address of the current instance.
 * @returns {string} The result from the API request.
 */
function APICall(apiPath, postData, jsonContentType, tokenId, timestamp, mac)
{
    const headers =
    {
        "x-strath-api-mac": mac,
        "x-strath-api-timestamp": timestamp,
        "x-strath-api-servicetype": "MENU",
        "Content-Type": jsonContentType ? "application/json" : "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json",
        "x-strath-api-tokenid": tokenId || "",
        "x-strath-api-appversion": APP_VERSION
    };

    const options =
    {
        hostname: STRATH_URL,
        path: apiPath,
        method: "POST",
        headers: headers
    };

    return new Promise((resolve, reject) =>
    {
        const req = https.request(options, (res) =>
        {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            
            res.on("end", () =>
            {
                resolve(data);
            });
        });

        req.on("error", (err) =>
        {
            reject(err);
        });

        if (postData != null) req.write(postData);
        req.end();
    });
}

/**
 * Log into MyPlace.
 * @param {string} username Your DS username.
 * @param {string} password Your DS password.
 * @returns {[tokenId, deviceId, userType, userKey, libraryNumber, JSON]}
 */
async function Login(username, password)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(LOGIN_API.SERVICE, timestamp);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "timestamp": timestamp,
        "mac": mac,
        "username": username,
        "password": password,
    }).toString();

    const data = await APICall(LOGIN_API.PATH, postData, false, null, timestamp, mac);
    const retrieved = JSON.parse(data);
    return [retrieved.data.tokenID, retrieved.data.deviceUID, retrieved.data.accounts[0].userType, retrieved.data.accounts[0].userKey, retrieved.data.accounts[0].libraryNumber, retrieved];
}

/**
 * Chooses an account so that all APIs work properly, this is usually needed.
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @param {string} userType The type of the user, normally `VAX`.
 * @param {string} userKey Your user id.
 * @returns {JSON}
 */
async function ChooseAccount(tokenId, deviceId, userType, userKey)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(CHOOSE_ACCOUNT_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac,
        "portalName": "MPEG_STUDENT_PORTAL",
        "userType": userType,
        "userKey": userKey
    }).toString();

    const data = await APICall(CHOOSE_ACCOUNT_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * Logs out of MyPlace. It is best to always do this after you're done with a token id & device id.
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON}
 */
async function Logout(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(LOGOUT_API.SERVICE, timestamp, tokenId, deviceId);

    const data = await APICall(LOGOUT_API.PATH, null, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} The class timetable.
 */
async function GetTimetable(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(CLASS_TIMETABLE_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(CLASS_TIMETABLE_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} The exam timetable.
 */
async function GetExamTimetable(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(EXAM_TIMETABLE_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(EXAM_TIMETABLE_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} The notices count.
 */
async function GetNoticesCount(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(NOTICES_COUNT_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(NOTICES_COUNT_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} Sets all notices as read.
 */
async function SetAllNoticesRead(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(SET_ALL_NOTICES_READ_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = JSON.stringify(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    });

    const data = await APICall(SET_ALL_NOTICES_READ_API.PATH, postData, true, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @param {number} since Since a certain time (unix timestamp).
 * @returns {JSON} The notices count.
 */
async function GetNewNotices(tokenId, deviceId, since)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(NEW_NOTICES_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac,
        "since": since
    }).toString();

    const data = await APICall(NEW_NOTICES_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @param {number} start Starting position, e.g. `0`.
 * @param {number} limit How many to get? e.g. `200`.
 * @returns {JSON} The notices.
 */
async function GetNotices(tokenId, deviceId, start, limit)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(NOTICES_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac,
        "start": start,
        "limit": limit
    }).toString();

    const data = await APICall(NOTICES_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A list of deadlines.
 */
async function GetDeadlines(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(DEADLINES_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(DEADLINES_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} Get all the class results.
 */
async function GetClassResults(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(CLASS_RESULTS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(CLASS_RESULTS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} Get all the exam results.
 */
async function GetExamResults(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(EXAM_RESULTS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(EXAM_RESULTS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A list of classes that have available past exam papers.
 */
async function GetClassesWithExamPapers(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(EXAM_PAPERS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(EXAM_PAPERS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @returns {JSON} A list of available lab PCs, no login required.
 */
async function GetLabPCs()
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(LAB_PC_AVAILABILITY_API.SERVICE, timestamp);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(LAB_PC_AVAILABILITY_API.PATH, postData, false, null, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @param {string} from From a certain date, e.g. `"2024-02-01T00:00:00"`
 * @param {string} to To a certain date, e.g. `"2024-03-17T23:59:17"`
 * @returns {JSON} A list of bookings.
 */
async function GetBookings(tokenId, deviceId, from, to)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(GET_BOOKINGS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac,
        "aFrom": from,
        "aTo": to
    }).toString();

    const data = await APICall(GET_BOOKINGS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A list of loaned library books.
 */
async function GetLibraryLoanedBooks(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(LIBRARY_LOANED_BOOKINGS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(LIBRARY_LOANED_BOOKINGS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A cache of everything.
 */
async function CachePolicy(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(CACHE_POLICY_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(CACHE_POLICY_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A list of classes.
 */
async function GetClasses(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(MYPLACE_CLASSES_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(MYPLACE_CLASSES_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

/**
 * @param {string} tokenId The token id of the account.
 * @param {string} deviceId The device id of the account.
 * @returns {JSON} A list of mobile accounts.
 */
async function GetMobileAccounts(tokenId, deviceId)
{
    const timestamp = GetTimestamp();
    const mac = await GetMAC(MOBILE_ACCOUNTS_API.SERVICE, timestamp, tokenId, deviceId);
    const postData = new URLSearchParams(
    {
        "portalGroup": "MPEG_MOBILE_PORTALS",
        "tokenId": tokenId,
        "deviceId": deviceId,
        "timestamp": timestamp,
        "mac": mac
    }).toString();

    const data = await APICall(MOBILE_ACCOUNTS_API.PATH, postData, false, tokenId, timestamp, mac);
    return JSON.parse(data);
}

module.exports =
{
    GetMAC,
    GetTimestamp,
    Login,
    ChooseAccount,
    Logout,
    GetTimetable,
    GetExamTimetable,
    GetNoticesCount,
    SetAllNoticesRead,
    GetNewNotices,
    GetNotices,
    GetDeadlines,
    GetClassResults,
    GetExamResults,
    GetClassesWithExamPapers,
    GetLabPCs,
    GetBookings,
    GetLibraryLoanedBooks,
    CachePolicy,
    GetClasses,
    GetMobileAccounts
};