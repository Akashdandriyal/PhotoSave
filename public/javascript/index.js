//Login form validation

const loginUsername = document.getElementById("loginUsername");
if(loginUsername !== null) {
    loginUsername.onblur = async () => {
    
        if(loginUsername.value !== "") {
            await fetch("/validateUsername", {
                method: "POST", 
                  
                // Adding headers to the request 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
        
                // Adding body to send 
                body: `username=${loginUsername.value}`
               
            })
            .then(response => response.json())
            .then(data => {
                if(data.found === false) {
                    document.getElementById("loginUsernameError").innerText = "Username not found";
                } else {
                    document.getElementById("loginUsernameError").innerText = "";
                }
            })
            .catch(reject => console.log(reject));
        }
    }
}

const loginValidate = async (event) => {
    let userName = document.login.username.value;
    let password = document.login.password.value;
    var status = false;
    event.preventDefault();
    console.log(userName, password);
    await fetch("/validateLogin", {
        method: "POST",

        // Adding headers to the request 
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        // Adding body to send 
        body: `username=${userName}&password=${password}`
    })
    .then(response => response.json())
    .then(data => {
        if(data.found === true) {
            status = true;
            document.getElementById("loginPasswordError").innerText="";
            document.getElementById("loginForm").submit();
        } else {
            document.getElementById("loginPasswordError").innerText="Invalid Password";
        }
        console.log(status);
        return status;
    })
    .catch(reject => console.log(reject));
}

//Signup form validation


let signupFields = {
    email: false,
    name: false,
    username: false,
    password: false
}

const signupEmail = document.getElementById("signupEmail");
if(signupEmail !== null) {
    signupEmail.onblur = () => {
        if(signupEmail.value !== "") {
            let element = document.getElementById("signupEmailContainerAlert");
            if(!RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(signupEmail.value)) {
                element.classList.remove("valid");
                element.classList.add("invalid");
                element.innerText = "Invalid email-Id";
                signupFields.email = false;
            } else {
                element.classList.remove("invalid");
                element.classList.add("valid");
                element.innerText = "";
                signupFields.email = true;
            }
        }
    }
}

const signupName = document.getElementById("signupName");
if(signupName !== null) {
    signupName.onblur = () => {
        if(signupName.value !== "") {
            let element = document.getElementById("signupNameContainerAlert");
            if(!RegExp(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g).test(signupName.value)) {
                element.classList.remove("valid");
                element.classList.add("invalid");
                element.innerText = "Name can't contain numbers or symbols";
                signupFields.name = false;
            } else {
                element.classList.remove("invalid");
                element.classList.add("valid");
                element.innerText = "";
                signupFields.name = true;
            }
        }
    }
}

const signupUsername = document.getElementById("signupUsername");
if(signupUsername !== null) {
    signupUsername.onblur = async () => {
    
        if(signupUsername.value !== "") {
            await fetch("/validateUsername", {
                method: "POST", 
                  
                // Adding headers to the request 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
        
                // Adding body to send 
                body: `username=${signupUsername.value}`
               
            })
            .then(response => response.json())
            .then(data => {
                let element = document.getElementById("signupUsernameContainerAlert");
                if(data.found === false) {
                    element.classList.remove("invalid");
                    element.classList.add("valid");
                    element.innerText = "Username available";
                    signupFields.username = true;
                } else {
                    element.classList.remove("valid");
                    element.classList.add("invalid");
                    element.innerText = "Username not available";
                    signupFields.username = false;
                }
            })
            .catch(reject => console.log(reject));
        }
    }
}

const signupPassword = document.getElementById("signupPassword");
if(signupPassword !== null) {
    signupPassword.onblur = () => {
        let element = document.getElementById("signupPasswordContainerAlert");
        if(signupPassword.value.length < 6) {
            element.classList.remove("valid");
            element.classList.add("invalid");
            element.innerText = "Password should be minimum 6 characters";
            signupFields.password = false;
        } else {
            element.classList.remove("invalid");
            element.classList.add("valid");
            element.innerText = "";
            signupFields.password = true;
        }
    }
}

const signupValidate = (event) => {
    if(signupFields.name === true && signupFields.username === true && signupFields.password === true) {
        return true;
    } else {
        return false;
    }
}