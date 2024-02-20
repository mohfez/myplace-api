// needs custom library: bwip-js
const bwipjs = require("bwip-js");
const fs = require("fs/promises");

async function CreateLibraryBarcode(libraryNumber, filePath)
{
    const options =
    {
        bcid: "rationalizedCodabar",
        text: `A${libraryNumber}A`,
        color: "#000000",
        backgroundcolor: "#ffffff",
        includetext: true,
        textxalign:  "center",
        alttext: libraryNumber,
        padding: 8,
        scale: 3
    };

    const res = await bwipjs.toBuffer(options);
    await fs.writeFile(filePath, res);
    console.log(`Barcode created successfully, path: ${filePath}.`);
}

module.exports =
{
    CreateLibraryBarcode
}