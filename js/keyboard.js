var keyboardShown = true;

function toggleKeyboard() {
 if(keyboardShown) {
  keyboard.style.display = 'none';
 }
 else {
  keyboard.style.display = 'inline';
 }
 
 keyboardShown = !keyboardShown;
}
 
function handleKeyboard (key) {
    //Tone can't do special sharps, need # isntead of ♯
    var noSharp = key;
    if(key[1] == "♯") {
        noSharp = key[0]+"#"+key[2];
    }
    synth.triggerAttackRelease(noSharp, "8n");
}
 
 function handleKeyboardPitches (pitches) {
    console.log("generating keyboard pitches for: " + pitches);
    //copy and pasted from matrix.saveMatrix (), the original had too many array dimensions so the forloop has been removed
    var noteConversion = {'C': 'do', 'D': 're', 'E': 'mi', 'F': 'fa', 'G': 'sol', 'A': 'la', 'B': 'ti', 'R': 'rest'};
    var newStack = [[0, ["action", {"collapsed":false}], 100, 100, [null, 1, null, null]], [1, ["text", {"value":"chunk"}], 0, 0, [0]]];
    var endOfStackIdx = 0;
    for (var i = 0; i < pitches.length; i++) {
    // We want all of the notes in a column.
    // console.log(this.notesToPlay[i]);
        var note = pitches[i].slice(0);
 
    // Add the Note block and its value
        var idx = newStack.length;
        newStack.push([idx, 'note', 0, 0, [endOfStackIdx, idx + 1, idx + 2, null]]);
        var n = newStack[idx][4].length;
        if (i == 0) {  // the action block
            newStack[endOfStackIdx][4][n - 2] = idx;
        } 
        else { // the previous note block
            newStack[endOfStackIdx][4][n - 1] = idx;
        }
        var endOfStackIdx = idx;
        newStack.push([idx + 1, ['number', {'value': "2"}], 0, 0, [idx]]);
        // Add the pitch blocks to the Note block
        var  notePitch = note.substring(0,note.length-1);  //i.e. D or D# not D#1
        var thisBlock = idx + 2;
 
        // We need to point to the previous note or pitch block.
        var previousBlock = idx;  // Note block
  
  
        // The last connection in last pitch block is null.
        var lastConnection = null;

        newStack.push([thisBlock, 'pitch', 0, 0, [previousBlock, thisBlock + 1, thisBlock + 2, lastConnection]]);
        if(['♯', '♭'].indexOf(notePitch[1]) != -1) {
            newStack.push([thisBlock + 1, ['solfege', {'value': noteConversion[note[0]] + note[1]}], 0, 0, [thisBlock]]);
            newStack.push([thisBlock + 2, ['number', {'value': note[note.length-1]}], 0, 0, [thisBlock]]);
        } 
        else {
            newStack.push([thisBlock + 1, ['solfege', {'value': noteConversion[notePitch[0]]}], 0, 0, [thisBlock]]);
            newStack.push([thisBlock + 2, ['number', {'value': note[note.length-1]}], 0, 0, [thisBlock]]);
        }
    }
    console.log(newStack);
    blocks.logo.blocks.loadNewBlocks(newStack);
 }
 //not sure if there's a synth already in the program
 var synth = new Tone.SimpleSynth().toMaster();
 
 function setupKeyboard () {
    var keyboard = document.getElementById("keyboard");
    var keyboardDoc = (keyboard.contentWindow || keyboard.contentDocument);
    if (keyboardDoc.document) {
        keyboardDoc = keyboardDoc.document;
    }
    
    //sets the callbacks for keypress on the keyboard
    keyboardDoc.body.keyHandle = window.handleKeyboard;
    keyboardDoc.body.pitchHandle = window.handleKeyboardPitches;
}