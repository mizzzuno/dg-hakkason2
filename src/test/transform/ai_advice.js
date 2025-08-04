function ai_advice(){
    postAPI().then(response => {
        const { formatted, error } = response_format(response);
        if (error.length) {
            console.log(error);
        } else {
            console.log(formatted);
        }
    });
}

async function postAPI() {
    const api_key = "AIzaSyDnTmMb3jtnFLcloRnvXR3v3gDgJHUk6Mo";
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const indicatorHL= getJsons("exinput.json");
    const indicatorR= getJsons("exremove.json");
    const resultsHL = getJsons("hl_results.json");
    const resultsR = getJsons("r_results.json");
    
    const prompt = createPrompt(indicatorHL,indicatorR,resultsHL, resultsR); // プロンプトを生成する関数を呼び出す
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
    };

    const response_text = await fetch(`${endpoint}?key=${api_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await response_text.json();
    return result
}

function response_format(raw_response) {
    const error = [];
    let formatted = null;
    if (!raw_response?.candidates?.length) {
        console.log("APIレスポンスが不正です");
        error.push("APIレスポンスが不正です");
        return { formatted, error };
    }
    const generatedText = raw_response.candidates[0]?.content?.parts?.[0]?.text || "";
    formatted = generatedText.trim();
    return { formatted, error };
}


function getJsons(file_name){
    const filePath = path.join(__dirname, '../data/${file_name}');
    if (!fs.existsSync(filePath)) {
        console.log("ファイルが存在しません:", filePath);
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData;
}

function createPrompt(indicatorHL, indicatorR, resultsHL, resultsR) {
    prompt
}
//テスト実行
if (require.main === module) {
    ai_advice();
}



