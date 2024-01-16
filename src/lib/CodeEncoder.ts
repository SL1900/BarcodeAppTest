const Code128_IDS = [
    "212222",
    "222122",
    "222221",
    "121223",
    "121322",
    "131222",
    "122213",
    "122312",
    "132212",
    "221213",
    "221312",
    "231212",
    "112232",
    "122132",
    "122231",
    "113222",
    "123122",
    "123221",
    "223211",
    "221132",
    "221231",
    "213212",
    "223112",
    "312131",
    "311222",
    "321122",
    "321221",
    "312212",
    "322112",
    "322211",
    "212123",
    "212321",
    "232121",
    "111323",
    "131123",
    "131321",
    "112313",
    "132113",
    "132311",
    "211313",
    "231113",
    "231311",
    "112133",
    "112331",
    "132131",
    "113123",
    "113321",
    "133121",
    "313121",
    "211331",
    "231131",
    "213113",
    "213311",
    "213131",
    "311123",
    "311321",
    "331121",
    "312113",
    "312311",
    "332111",
    "314111",
    "221411",
    "431111",
    "111224",
    "111422",
    "121124",
    "121421",
    "141122",
    "141221",
    "112214",
    "112412",
    "122114",
    "122411",
    "142112",
    "142211",
    "241211",
    "221114",
    "413111",
    "241112",
    "134111",
    "111242",
    "121142",
    "121241",
    "114212",
    "124112",
    "124211",
    "411212",
    "421112",
    "421211",
    "212141",
    "214121",
    "412121",
    "111143",
    "111341",
    "131141",
    "114113",
    "114311",
    "411113",
    "411311",
    "113141",
    "114131",
    "311141",
    "411131",
    "211412",
    "211214",
    "211232",
    "2331112"
];

function EncodeToFont(text: string) {
    let current_mode = "C";

    let barcode_array = [];
    let barcode_index = 0;

    for (let i = 0; i < text.length; i++) {
        // 
        let char_code_curr = text[i].charCodeAt(0);
        if (char_code_curr > 127) continue;

        let char_code_next = i < text.length - 1 ? text[i + 1].charCodeAt(0) : 0;

        // Mode C - number pair
        if (char_code_curr >= 48 && char_code_curr <= 57 &&
            char_code_next >= 48 && char_code_next <= 57) {
            // Start Mode C
            if (barcode_index == 0) 
            {
                barcode_array[barcode_index] = 105;
                current_mode = "C";
                barcode_index++;
            }
            else if (current_mode != "C") 
            {
                barcode_array[barcode_index] = 99;
                current_mode = "C";
                barcode_index++;
            }

            barcode_array[barcode_index] = +(text[i] + "" + text[i + 1]);
            barcode_index++;
            i++;
        }
        else {
            //
            if (barcode_index == 0) {
                if (char_code_curr < 32) {
                    current_mode = "A";
                    barcode_array[barcode_index] = 103;
                }
                else {
                    current_mode = "B";
                    barcode_array[barcode_index] = 104;
                }
                barcode_index++;
            }

            if (char_code_curr < 32 && current_mode != "A") {
                current_mode = "A";
                barcode_array[barcode_index] = 101;
                barcode_index++;

            }
            else if ((char_code_curr >= 64 && current_mode != "B") ||
                (current_mode == "C")) {
                current_mode = "B";
                barcode_array[barcode_index] = 100;
                barcode_index++;
            }

            if (char_code_curr < 32) {
                barcode_array[barcode_index] = char_code_curr + 64;
            }
            else {
                barcode_array[barcode_index] = char_code_curr - 32;
            }
            barcode_index++;
        }
    }

    let check_sum = barcode_array[0] % 103;
    for (let i = 1; i < barcode_index; i++) {
        check_sum = (check_sum + barcode_array[i] * i) % 103;
    }

    barcode_array[barcode_index] = check_sum;
    barcode_index++;

    barcode_array[barcode_index] = 106;
    barcode_index++;

    return barcode_array.map(char => {
        let id = Code128_IDS[char];
        if (id == "211412") return "A";
        if (id == "211214") return "B";
        if (id == "211232") return "C";
        if (id == "2331112") return "@";

        let result = "";
        let parts = [id.slice(0, 2), id.slice(2, 4), id.slice(4, 6)];
        for (let part of parts) {
            switch (part) {
                case "11":
                    result += "0"
                    break;
                case "21":
                    result += "1"
                    break;
                case "31":
                    result += "2"
                    break;
                case "41":
                    result += "3"
                    break;
                case "12":
                    result += "4"
                    break;
                case "22":
                    result += "5"
                    break;
                case "32":
                    result += "6"
                    break;
                case "42":
                    result += "7"
                    break;
                case "13":
                    result += "8"
                    break;
                case "23":
                    result += "9"
                    break;
                case "33":
                    result += ":"
                    break;
                case "43":
                    result += ";"
                    break;
                case "14":
                    result += "<"
                    break;
                case "24":
                    result += "="
                    break;
                case "34":
                    result += ">"
                    break;
                case "44":
                    result += "?"
            }
        }
        console.log(id, char, result);
        return result;
    }).join("");
}

function EncodeBarcode(cell_name: string) {
    // 
    if (!cell_name.match(/.{3}-.{3}-\d{2}-\d{2}-\d{2}/ig)) return null;

    let valid_symbols =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    let mults = [215737344, 3172608, 46656, 1296, 36, 1];

    let text = cell_name.replaceAll("-", "").toUpperCase();
    let tail = text.slice(-6);

    let left = 0;
    for (let i = 5; i >= 0; i--) {
        left += (valid_symbols.indexOf(text[i])) * mults[i];
    }

    return (left + tail);
}

function DecodeBarcode(code: string) {
    // 
    let symbols =
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
    let mults = [215737344, 3172608, 46656, 1296, 36, 1];
    let tail = code.slice(-6);
    let code_number = +code.slice(0,code.length - 6);

    console.log(code_number)

    let result = [];
    for(let i = 0; i < 6; i++)
    {
        let index = Math.floor(code_number / mults[i]);
        result.push(index);
        code_number -= index * mults[i];
    }
    let left = result.map( id => symbols[id]).join("").match(/.{1,3}/g)?.join("-");
    return left + "-" + tail.match(/.{1,2}/g)?.join("-");
}

export {
    EncodeToFont,
    DecodeBarcode,
    EncodeBarcode
}