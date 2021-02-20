// Loading screen

function onReady(callback) {
    var intervalID = window.setInterval(checkReady, 1000);

    function checkReady() {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalID);
            callback.call(this);
        }
    }
}

function show(id, value) {
    document.getElementById(id).style.display = value ? 'block' : 'none';
}

onReady(function () {
    show('page', true);
    show('loading', false);
});

//get quotes
fetch("https://type.fit/api/quotes")
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        let quote = document.getElementsByClassName("quote");
        let author = document.getElementsByClassName("author");
        let random = Math.floor(Math.random() * data.length);
        quote[0].innerHTML = data[random].text;
        if(data[random].author !== null) {
            author[0].innerHTML = " -" + data[random].author;
        }
    });

// File validation
const validateFileType = document.getElementById("image");
validateFileType.onchange = () => {
    var fileName = validateFileType.value;
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile ==="jpg" || extFile ==="jpeg" || extFile ==="png"){
        
    } else {
        validateFileType.value = '';
        alert("Only jpg/jpeg and png images are allowed!");
    }
}

document.getElementById("resetFileContent").onclick = () => {
    let fileInput = document.getElementById("image");
    fileInput.value = '';
}

