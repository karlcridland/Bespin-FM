let questions = [];

// Sorts through the questions and returns whether a question has the same id and uid as the parameters.

function questionPresent(uid,id){
    let found = false
    questions.forEach(function (question){
        if (question.id === id && question.uid === uid){
            found =  true;
        }
    })
    return found;
}

// Displays the questions to the screen, sorts through which question has the highest amount of likes then puts it in
// the column with the lowest y value attributed to it or if all equal goes to the left most column.

function displayQuestions(){
    questions.sort(function (a,b){
        if (a.likes < b.likes){
            return 1;
        }
        if (a.likes > b.likes){
            return -1;
        }
        return 0;
    })
    let maxY = {1:0,2:0,3:0,4:0,5:0};
    for (let i = 1; i <= 5; i++){
        document.getElementById('col_'+i).innerHTML = '';
    }
    function getLowest(){
        for (let i = 1; i <= 5; i++){
            if (i < 5 && maxY[i-1] > maxY[i]){
                return i;
            }
        }
        if (maxY[5] < maxY[1]){
            return 5;
        }
        return 1;
    }
    questions.forEach(function (question){
        const next = question.display();
        const i = getLowest();
        document.getElementById('col_'+i).appendChild(next);
        maxY[i] = next.offsetTop+next.offsetHeight;
    })
}

// Downloads all questions from the database, uid will be picked up from authentication. Loops through users, then
// loops through questions (key is date time), then pushes to the questions array and calls displayQuestions() at the
// end. Updates to the database call for the function to be used but any already loaded questions are disregarded.

ref.child('questions').on('value',snapshot=>{
    snapshot.forEach(function (user){
        user.forEach(function (question){
            if (!questionPresent(user.key,question.key)){
                const body = question.child('question').val();
                const likes = question.child('likes').numChildren();
                let liked = false;
                let flagged = false;
                try{
                    flagged = Object.keys(question.child('flags').val()).includes(uid);
                }catch (e) {

                }
                try{
                    liked = Object.keys(question.child('likes').val()).includes(uid);
                }catch (e) {

                }
                const next = new Question(body,likes,liked,flagged,user.key,question.key);
                questions.push(next);
            }
        })
    })
    displayQuestions();
})

// Sends a question to the database, text is the text area and send is the send button. Element flies off screen and
// returns after the message has been loaded into the database. Checks there is a question and that the user is signed
// in before sending.

const text = document.getElementById('text');
const send = document.getElementById('send');
send.onclick = function (){
    if (text.value.length > 0 && uid !== undefined){
        document.getElementById('ask question').style.transform = 'translateY(300px)';
        ref.child('questions/'+uid+'/'+(new Date()).stamp()+'/question').set(text.value).then(function (){
            text.value = '';
            window.setTimeout(function (){
                document.getElementById('ask question').style.transform = 'unset';
            },1000);
        })
    }
}