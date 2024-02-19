const api = require("./m_api");
/*
// enable this if you're generating barcodes
const barcode_gen = require("./student_card/barcode_generator")
*/

// the Sleep() function is not needed, it's just there to give me some time to read the console
async function Example()
{
    const [tokenId, deviceId, userType, userKey, libraryNumber, loginJsonResult] = await api.Login("abc12345", "password"); // login using ds username and pass
    if (tokenId == null || deviceId == null) return; // login failed?
    console.log(`Logged in, account id: ${userKey}`);

    /*
    // example on creating a barcode:
    await barcode_gen.createStudentBarcode(libraryNumber, "./student_card/barcode.png");
    await Sleep(3000);
    */

    const chooseAccountJsonResult = await api.ChooseAccount(tokenId, deviceId, userType, userKey); // choose this account to get timetables, notices, etc.
    console.log(chooseAccountJsonResult);
    await Sleep(3000);
    
    const getNoticesJsonResult = await api.GetNotices(tokenId, deviceId, 0, 200); // get notices
    console.log(getNoticesJsonResult);
    await Sleep(3000);
    
    const getBookingsJsonResult = await api.GetBookings(tokenId, deviceId, "2024-02-01T00:00:00", "2024-03-17T23:59:17"); // get bookings
    console.log(getBookingsJsonResult);
    await Sleep(3000);
    
    const getTimetableJsonResult = await api.GetTimetable(tokenId, deviceId); // get timetable
    console.log(getTimetableJsonResult);
    await Sleep(3000);
    
    const getExamTimetableJsonResult = await api.GetExamTimetable(tokenId, deviceId); // get exam timetable
    console.log(getExamTimetableJsonResult);
    await Sleep(3000);
    
    const getNoticeCountJsonResult = await api.GetNoticesCount(tokenId, deviceId); // get notices count
    console.log(getNoticeCountJsonResult);
    await Sleep(3000);
    
    const getNewNoticesJsonResult = await api.GetNewNotices(tokenId, deviceId, 1707930141); // get new notices since 1707930141
    console.log(getNewNoticesJsonResult);
    await Sleep(3000);
    
    const setNoticesReadJsonResult = await api.SetAllNoticesRead(tokenId, deviceId); // get notices read
    console.log(setNoticesReadJsonResult);
    await Sleep(3000);
    
    const getDeadlinesJsonResult = await api.GetDeadlines(tokenId, deviceId); // get deadlines
    console.log(getDeadlinesJsonResult);
    await Sleep(3000);
    
    const getClassResultsJsonResult = await api.GetClassResults(tokenId, deviceId); // get class results
    console.log(getClassResultsJsonResult);
    await Sleep(3000);
    
    const getExamResultsJsonResult = await api.GetExamResults(tokenId, deviceId); // get exam results
    console.log(getExamResultsJsonResult);
    await Sleep(3000);
    
    const getClassesWithExamPapersJsonResult = await api.GetClassesWithExamPapers(tokenId, deviceId); // get classes with exam papers
    console.log(getClassesWithExamPapersJsonResult);
    await Sleep(3000);
    
    const getLabPCsJsonResult = await api.GetLabPCs(); // get available lab pcs (does not need token id / device id)
    console.log(getLabPCsJsonResult);
    await Sleep(3000);
    
    const getLoanedBooksJsonResult = await api.GetLibraryLoanedBooks(tokenId, deviceId); // get loaned books
    console.log(getLoanedBooksJsonResult);
    await Sleep(3000);
    
    const getClassesJsonResult = await api.GetClasses(tokenId, deviceId); // get classes
    console.log(getClassesJsonResult);
    await Sleep(3000);
    
    const getMobileAccountsJsonResult = await api.GetMobileAccounts(tokenId, deviceId); // get accounts
    console.log(getMobileAccountsJsonResult);
    await Sleep(3000);

    const logoutJsonResult = await api.Logout(tokenId, deviceId); // logout when finished
    console.log(logoutJsonResult);
}

function Sleep(ms)
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, ms);
    });
}

Example();
