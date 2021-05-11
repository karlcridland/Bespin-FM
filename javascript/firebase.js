
let uid;
let firebaseConfig = {
    apiKey: "AIzaSyB_j7x6nBnZ7Sj1ZWGitd7L7QDau3TDRNI",
    authDomain: "bespinfm.firebaseapp.com",
    databaseURL: "https://bespinfm-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bespinfm",
    storageBucket: "bespinfm.appspot.com",
    messagingSenderId: "646694024488",
    appId: "1:646694024488:web:272e7252c2d4317dd08c1d",
    measurementId: "G-P9Y3CRDG74"
};

firebase.initializeApp(firebaseConfig);
let storage = firebase.storage();
let ref = firebase.database().ref();

// Creates a time stamp with year, month, day, hour, minute, second - used mainly for keys.

Date.prototype.stamp = function (){
    let d = this;
    let month = '' + (d.getMonth());
    let day = '' + (d.getDate());
    let year = '' + (d.getFullYear());
    let hour = '' + (d.getHours());
    let minute = '' + (d.getMinutes());
    let second = '' + (d.getSeconds());

    let b = [year];
    [month,day,hour,minute,second].forEach(function (a){
        if (a.length < 2){
            b.push('0' + a);
        }
        else{
            b.push(a);
        }
    })

    return b.join(':');
}

// Opens the menu bar for signing in and account information, slide transition takes 400ms - button is unresponsive
// during this time.

let signInExpanded = false;
let signInReady = true;
let width;
let switchedTo = 'email address sign in input';
function signIn(){
    if (signInReady){
        signInExpanded = !signInExpanded;

        width = window.innerWidth - document.getElementById('home button').offsetLeft;
        if (signInExpanded){
            document.getElementById('account button').textContent = 'close';
            width = window.innerWidth - document.getElementById('home button').offsetLeft;
            document.getElementById('body container').style.width = 'calc(100% - '+width+'px)';
            document.getElementById('sign in background').style.left = 'calc(100% - '+width+'px)';
            document.getElementById('sign in background').style.width = width+'px';
            document.getElementById('sign in background').style.boxShadow = '-5px 0 20px 0 rgba(0, 0, 0, 0.05)';
            try{
                document.getElementById('question panel').style.left = 'calc(50% - '+width/2+'px - 220px)';
            }
            catch (e){}
        }else{
            document.getElementById('account button').textContent = {true:'sign in',false:'account'}[uid === undefined];
            document.getElementById('body container').style.width = '100%';
            document.getElementById('sign in background').style.boxShadow = 'unset';
            document.getElementById('sign in background').style.left = '100%';
            document.getElementById('sign in background').style.width = '0';
            try{
                document.getElementById('question panel').style.left = 'calc(50% - 220px)';
            }catch (e) {

            }
        }
        focusInput(switchedTo);
    }
    signInReady = false;
    window.setTimeout(function (){
        signInReady = true;
    },400);
}

// Generates the sign in/account menu, populating the element with relevant information dependent on authentication
// status.

function populateAccountBar(){
    const menu = document.getElementById('sign in background');
    menu.innerHTML = '';
    if (uid === undefined){
        const menuSwitch = document.createElement('div');
        menuSwitch.setAttribute('class','menuSwitch');
        menu.appendChild(menuSwitch);

        let clickCount = 1;
        const options = ['sign in','register'];
        options.forEach(function (label){
            const button = document.createElement('div');
            button.setAttribute('class','menuSwitchOption')
            button.textContent = label;
            menuSwitch.appendChild(button);
        })

        const button = document.createElement('div');
        button.setAttribute('class','menuSwitchButton');
        menuSwitch.appendChild(button);

        const slideView = document.createElement('div');
        slideView.setAttribute('class','slideView');
        slideView.style.width = 2*width+'px'
        menu.appendChild(slideView);
        const screen_a = returningUserScreen();
        const screen_b = createUserScreen();
        [screen_a,screen_b].forEach(function (screen){
            slideView.appendChild(screen);
        })
        document.getElementById('terms').onclick = function (e){
            e.stopPropagation();
        }

        let buttonTimeout = true;
        function updateButton(){
            if (buttonTimeout){
                if ((clickCount++)%2 === 0){
                    button.style.left = '50%'
                    slideView.style.transform = 'translateX(-50%)';
                    switchedTo = 'name register input';
                }
                else{
                    button.style.left = '0'
                    slideView.style.transform = 'unset';
                    switchedTo = 'email address sign in input';
                }

                focusInput(switchedTo);

                button.textContent = options[clickCount%2];
            }
            buttonTimeout = false;
            screen_a.style.display = 'block';
            screen_b.style.display = 'block';
            window.setTimeout(function (){
                buttonTimeout = true;
                slideView.style.transition = 'none';
                if (clickCount%2 === 1){
                    screen_a.style.display = 'none';
                    screen_b.style.display = 'block';
                    slideView.style.transform = 'unset';
                }
                else{
                    screen_a.style.display = 'block';
                    screen_b.style.display = 'none';
                }
            },400)
        }
        updateButton();
        menuSwitch.onclick = updateButton;
        focusInput('email address sign in input')
    }
    else{
        menu.appendChild(userAccountView());
    }
}

// Focuses an input with a delay of 400ms.

function focusInput(id){
    window.setTimeout(function (){
        try{
            document.getElementById(id).focus();
        }
        catch (e) {
            
        }
    },400);
}

// Displays a user account.

function userAccountView(){
    const view = document.createElement('div');
    view.setAttribute('class','signInView');
    view.style.width = '100%';

    const pic = document.createElement('img');
    pic.setAttribute('class','profileImage');
    view.appendChild(pic);

    const name = document.createElement('div');
    name.setAttribute('class','profileName');
    view.appendChild(name);
    ref.child('users/info/name/'+uid).once('value',snapshot=>{
        console.log(snapshot.val())
        name.textContent = snapshot.val()
    })

    const signOutButton = document.createElement('div');
    signOutButton.setAttribute('class','signOut');
    signOutButton.textContent = 'Sign Out';
    view.appendChild(signOutButton);

    signOutButton.onclick = function (){
        signOut(function (success){
            console.log(success)
        })
    }

    return view;
}

// Returns the screen used when signing in for a returning user.

function returningUserScreen(){
    const view = document.createElement('div');
    view.setAttribute('class','signInView');

    let inputs = {};
    ['email address','password'].forEach(function (text){
        const label = appendLabel(view,text,'sign in');
        inputs[text] = label;
        label.onkeypress = function (e){
            if (e.key === 'Enter'){
                submit.click();
            }
        }
    })

    const forgot = document.createElement('div');
    forgot.setAttribute('class','forgotten');
    forgot.textContent = 'forgotten password?';
    view.appendChild(forgot);

    const submit = document.createElement('div');
    submit.setAttribute('class','signInSubmit');
    submit.textContent = 'Sign In';
    view.appendChild(submit);

    submit.onclick = function (){
        attemptSignIn(inputs['email address'].value,inputs['password'].value);
    }

    return view;
}

// Returns the screen used when creating a new user.

function createUserScreen(){
    const view = document.createElement('div');
    view.setAttribute('class','signInView');

    let inputs = {};
    ['name','email address','password','confirm password'].forEach(function (label){
        inputs[label] = appendLabel(view, label, 'register');
    })

    let termsClicked = true;

    const terms = document.createElement('div');
    terms.setAttribute('class','termsField');
    view.appendChild(terms);

    const termsButton = document.createElement('img');
    termsButton.setAttribute('class','termsButton');
    terms.appendChild(termsButton);

    const termsText = document.createElement('div');
    termsText.setAttribute('class','termsText');
    termsText.innerHTML = 'I have read and accept Bespin FM\'s <a href="../terms.html" target="_blank" id="terms" ' +
        'class="terms">Terms and Conditions</a>';
    terms.appendChild(termsText);

    terms.onclick = function (){
        termsClicked = !termsClicked;
        if (termsClicked){
            termsButton.src = 'media/check.png';
            termsButton.style.backgroundColor = '#a2d7f1';
        }
        else{
            termsButton.src = 'media/check_faded.png';
            termsButton.style.backgroundColor = 'white';
        }
    }
    terms.click();

    const submit = document.createElement('div');
    submit.setAttribute('class','signInSubmit');
    submit.textContent = 'Submit';
    view.appendChild(submit);

    submit.onclick = function (){
        createUser(inputs['name'].value,inputs['email address'].value,inputs['password'].value);
    }

    return view;
}

// Attempt sign in, used by the form in the sign in menu.

function attemptSignIn(email,password){
    firebase.auth().signInWithEmailAndPassword(email, password).then((user) => {
        uid = user.user.uid;
    }).catch((error) => {
        console.log(error);
    });
}

// Adds an input field to an element with a label preceding.

function appendLabel(view,label,descriptor){
    const text = document.createElement('div');
    text.setAttribute('class','signInLabel');
    text.textContent = label;
    view.appendChild(text);
    const input = document.createElement('input');
    input.setAttribute('class','signIn');
    view.appendChild(input);
    input.setAttribute('id',label+' '+descriptor+' input');

    switch (label){
        case 'email address':
            input.type = 'email';
            break;
        case 'password':
            input.type = 'password';
            break;
        case 'confirm password':
            input.type = 'password';
            break;
    }

    return input;
}

// Actively checks whether a user is signed in, if they are then their uid is stored.

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid;
    }
    else{
        uid = undefined;
    }
    const accountButton = document.getElementById('account button');
    if (accountButton.textContent !== 'close'){
        accountButton.textContent = {true:'sign in',false:'account'}[uid === undefined];
    }
    populateAccountBar();
});

// Signs a user out with a callback method.

function signOut(callback){
    firebase.auth().signOut().then(function() {
        uid = undefined;
        callback(true);
    }).catch(function(error) {
        // An error happened.
        console.log(error);
        callback(false);
    });
}

// Creates a user, registering with firebase and then updating the database where appropriate.

function createUser(name,email,password){
    firebase.auth().createUserWithEmailAndPassword(email,password).then((userCredential,error) => {
        console.log(userCredential,error);
        const user = firebase.auth().currentUser;
        ref.child('users/info/joined/'+user.uid).set(new Date().stamp()).then(function (){
            ref.child('users/info/name/'+user.uid).set(name).then(function (){
                user.sendEmailVerification().then(function() {
                    user.updateProfile({
                        displayName: name
                    }).then(function() {
                        populateAccountBar();
                    }).catch(function(error) {
                        // Error updating profile goes here.
                        console.log(error);

                    });
                }).catch(function(error) {
                    // Error sending email verification goes here.
                    console.log(error);

                });
            })
        })
    }).catch((error) => {
        // Error registering goes here.
        console.log(error);

    });
}

// Additional setup

document.getElementById('sign in background').style.width = '0';