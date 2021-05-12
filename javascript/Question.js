class Question{

    // Creates an instance of a Question class, actively listens to whether the amount of likes have changed and will
    // redisplay all questions if so.

    constructor(question,likes,liked,flagged,uid,id) {
        const q = this;
        q.question = question;
        q.likes = likes;
        q.liked = liked;
        q.flagged = flagged;
        q.uid = uid;
        q.id = id;
        ref.child('questions/'+this.uid+'/'+this.id+'/likes').on('value',snapshot=>{
            q.likes = snapshot.numChildren();
            displayQuestions();
        })

    }

    // Returns a div element with all features of the question including buttons to like and report, and also if the
    // element was created by the user a button to delete the post.

    display(){
        const question = this;
        const view = document.createElement('div');
        view.setAttribute('class','question');
        const questionBody = document.createElement('div');
        questionBody.setAttribute('class','questionBody');
        questionBody.innerHTML = question.question;
        view.appendChild(questionBody);
        const likesMenu = document.createElement('div');
        likesMenu.setAttribute('class','likesMenu');
        view.appendChild(likesMenu);
        const like = document.createElement('img');
        like.setAttribute('class','like');
        like.src = 'media/like.png';
        likesMenu.appendChild(like);
        const likeCount = document.createElement('div');
        likeCount.setAttribute('class','likeCount');
        likeCount.textContent = question.likes;
        likesMenu.appendChild(likeCount);
        const flag = document.createElement('img');
        flag.setAttribute('class','like');
        flag.src = 'media/flag.png';
        likesMenu.appendChild(flag);
        flag.style.left = 'unset';
        flag.style.right = '0';

        like.onclick = function (){
            if (!question.liked){
                ref.child('questions/'+question.uid+'/'+question.id+'/likes/'+uid).set(true);
                question.liked = true;
            }
            else{
                ref.child('questions/'+question.uid+'/'+question.id+'/likes/'+uid).set(null);
                question.liked = false;
            }
            displayQuestions();
        }
        if (question.liked){
            like.src = 'media/liked.png';
        }

        if (question.uid !== uid){
            flag.onclick = function (){
                question.flagged = !question.flagged;
                if (question.flagged){
                    ref.child('questions/'+question.uid+'/'+question.id+'/flags/'+uid).set(true);
                    flag.src = 'media/flagged.png';
                }
                else{
                    ref.child('questions/'+question.uid+'/'+question.id+'/flags/'+uid).set(null);
                    flag.src = 'media/flag.png';
                }
            }
            if (question.flagged){
                flag.src = 'media/flagged.png';
            }
        }
        else{
            flag.src = 'media/trash.png';
            flag.onclick = function (){
                ref.child('questions/'+question.uid+'/'+question.id).set(null);
                delete questions[questions.indexOf(question)];
                displayQuestions();
            }
        }

        return view;
    }
}
