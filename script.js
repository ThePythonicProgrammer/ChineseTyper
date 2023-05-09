// Both Time and Length can be altered from this code by simply changing the number.
// Time is test time in seconds and length is the number of characters to display. If you increase the time, increasing the number of characters to display is a good idea
let currentChapterList = []
let chineseType = "trad"
let time = 30
let randomLength = 128

document.addEventListener('DOMContentLoaded', onStart)

function onStart() {
    switchScreen('start')
    createSelectors()
    document.getElementById('testInput').value = ''
    document.getElementById('timer').innerHTML = time
}

function createSelectors() {
    const fullList = document.getElementById('chineseList');
    const selectorDiv = document.getElementById('selectorDiv')

    for (var i=0; i<fullList.children.length; i++) {
        const chapter = fullList.children[i]
        const meta = document.getElementById(chapter.id+"meta")
        
        let name;
        for (var j=0; j<meta.children.length; j++) {
            if (meta.children[j].className == "name") {
               name = meta.children[j].innerHTML 
            }
        }
        
        const p = document.createElement('p')
        const label = document.createElement('label')
        const input = document.createElement('input')
        const span = document.createElement('span')

        input.type = "checkbox"
        input.id = chapter.id
        input.onclick = chapterToggle

        span.innerHTML = name

        selectorDiv.appendChild(p)
        p.appendChild(label)
        label.appendChild(input)
        label.appendChild(span)
    }
}

function switchScreen(screenStr) {
    const main = document.getElementById('main')
    
    for (var i=0; i<main.children.length; i++) {
        if (main.children[i].id != screenStr) {
            main.children[i].style.display = 'none'
        } else {
            main.children[i].style.display = 'block'
        }
    }
}

function chapterToggle(e) {
    const checkbox = e.target.checked
    
    if (checkbox) {
        currentChapterList.push(e.target.id)
    } else {
        currentChapterList = currentChapterList.filter(x => x != e.target.id)
    }
    
    if (currentChapterList.length > 0) {
        createList()
    }
}

function createList() {
    const randomLengthPerChapter = Math.floor(randomLength/currentChapterList.length)
    let wordList = []

    currentChapterList.forEach(chapter => {
        const wordSet = document.getElementById(chapter+chineseType)
        for (var i=0; i<randomLengthPerChapter; i++) {
            const wordNum = Math.floor(Math.random() * wordSet.children.length)
            wordList.push(wordSet.children[wordNum].innerHTML)
        }
    })

    if (randomLength % currentChapterList.length != 0) {
        const wordSet = document.getElementById(currentChapterList[0]+chineseType)
        const wordNum = Math.floor(Math.random() * wordSet.children.length)
        wordList.push(wordSet.children[wordNum].innerHTML)
    }

    console.log(wordList)
    document.getElementById('testWords').innerHTML = ''
    wordList.forEach(word => {
        const span = document.createElement('span')
        span.innerHTML = word
        span.classList.add('flow-text')
        document.getElementById('testWords').appendChild(span)
    })
}

// This creates the event listener to check if someone types in the input box
function createTestListener() {
    document.getElementById('testInput').addEventListener('keydown', testFunction)
    console.log('connected keydown event listener')
}

function testFunction() {
    const interval = wordColoring();
    timer(interval)
    document.getElementById('testInput').removeEventListener('keydown', testFunction)
}

// runs the timer loop
function timer(colorInterval) {
    const timerInterval = setInterval(function () {
        document.getElementById('timer').innerHTML -= 1
        if (document.getElementById('timer').innerHTML <= 0) {
            clearInterval(timerInterval)
            cleanTest(colorInterval)
        }
    }, 1000)
}

function wordColoring() {
    const interval = setInterval(function() {
        // So for whoever has to debug this in the future, this is probably a little weird bc of the way
        // I implemented everything. testText uses children cause of all the <span> tags put in during the createList() function.
        // writtenText I then convert into an array to compare each letter individually with testText.
        const testText = document.getElementById('testWords').children
        const writtenText = document.getElementById('testInput').value.split('')
        
        for (var i=0; i<testText.length; i++) {
            // Reset Colors every time this is checked
            testText[i].className = ""
            testText[i].classList.add('flow-text')
            
            if (i >= writtenText.length) {
                testText[i].classList.add('black-text')
            } else {
                if (testText[i].innerHTML == writtenText[i]) {
                    testText[i].classList.add('green-text') 
                } else {
                    testText[i].classList.add('red-text') 
                }
            }
        }
    }, 300)
    return interval;
}

function cleanTest(colorInterval) {
    genStats()
    document.getElementById('timer').innerHTML = 30
    document.getElementById('testInput').value = ''
    clearInterval(colorInterval)

    switchScreen('stats')
}

function genStats() {
    const testWords = document.getElementById('testWords').children

    // Get Accuracy and CPM (Characters Per Minute)
    let correctWords = []
    let incorrectWords = []
    for (var i=0; i<testWords.length; i++) {
        if (testWords[i].classList.contains('green-text'))
            correctWords.push(testWords[i].innerHTML)
        if (testWords[i].classList.contains('red-text'))
            incorrectWords.push(testWords[i].innerHTML)
    }
    
    // Here we are changing the list of words into an object that has the amount of times that recurs
    const corrWords = correctWords.reduce(findRecurrence, {});
    const incorrWords = incorrectWords.reduce(findRecurrence, {})
    
    // Here we are performing black magic to sort that list so we can get the words to work on and the best words
    const sortedCorrWords = Object.fromEntries(
        Object.entries(corrWords).sort(([,a], [,b]) => b-a)
    )
    const sortedIncorrWords = Object.fromEntries(
        Object.entries(incorrWords).sort(([,a], [,b]) => b-a)
    )
   
    document.getElementById('cpm').innerHTML = correctWords.length / (time/60)
    document.getElementById('acc').innerHTML = `${correctWords.length}/${correctWords.length+incorrectWords.length}`
    
    // i here is the amount of words to show... 
    // I was going to write code to filter and show entries with more than x mistakes 
    // but that would lead to some edge cases when selecting a ton of units
    for (var i=0; i<3; i++) {
        const workStatement = document.createElement('p')
        const bestStatement = document.createElement('p')
        
        const workWord = Object.keys(sortedIncorrWords)[i]
        const bestWord = Object.keys(sortedCorrWords)[i]
       
        if (corrWords[workWord] == undefined) {
            corrWords[workWord] = 0
        }
        if (incorrWords[workWord] == undefined) {
            incorrWords[workWord] = 0
        }
        
        workStatement.innerHTML = `${workWord}: ${corrWords[workWord]}/${incorrWords[workWord] + corrWords[workWord]}`
        bestStatement.innerHTML = `${bestWord}: ${corrWords[bestWord]}/${incorrWords[bestWord] + corrWords[bestWord]}`
        
        document.getElementById('work').appendChild(workStatement)
        document.getElementById('best').appendChild(bestStatement)
    }

}

function findRecurrence(count, currentValue) {
    return (
        count[currentValue] ? ++count[currentValue] : (count[currentValue] = 1),
        count
    );
}

