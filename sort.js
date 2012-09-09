/* 
   Implements different sort methods and displays the sorting steps
   to the user.
   Main source: Levitin A., Mukherje S. and Bhattacharjee AK. 2012.
   Introduction to the Design and Analysis of Algorithms. 
   Third Edition. Pearson.

   Copyright (c) 2012 Nathan Geffen

   Permission is hereby granted, free of charge, to any person obtaining a
   copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software, and to
   permit persons to whom the Software is furnished to do so, subject to
   the following conditions:

   The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
   OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var basicOps = 0;
var measurements = { "comparisons":0,
                     "swaps":0,
                     "moves":0,
                     "insertions":0,
                     "copies":0
                   }

var showsteps = true;
var outputHTML = "";

generate = function() {
    var number_elements = document.
        getElementById("number-elements-edit").value;
    var list = [];

    if (document.getElementById("random-order").checked) 
        for (var i = 0; i < number_elements; i++) 
            list.push(Math.floor((Math.random() * number_elements))); 
    else if (document.getElementById("ascending-order").checked)
        for (var i = 0; i < number_elements; i++) 
            list.push(i);
    else 
        for (var i = number_elements-1; i >= 0; i--) 
            list.push(i);

    document.getElementById("list-to-sort").innerHTML = list.join(" ");
}

sort = function() {
    document.getElementById("sort-button").disabled = true;    
    listToSort = document.getElementById("list-to-sort").
        value.rtrim().split(/\s+/);

    if(document.getElementById("numeric-choice").checked) {
        for (i in listToSort) 
            listToSort[i] = +listToSort[i];
    };

    var outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "<p>List at start:</p>";
    output(listToSort);
    outputDiv.innerHTML += outputHTML;
    outputDiv.innerHTML += "<p>List length: " + 
        listToSort.length + "</p>";
    
    outputHTML = "";
    showsteps = document.getElementById("show-steps").checked;    
    if (showsteps && listToSort.length > 80) {
        outputDiv.innerHTML += 
        "<p>List too large to show steps.</p>"
        showsteps = false;
    }
    for (op in measurements) measurements[op] = 0;
    basicOps = 0;

    if (listToSort.length) {        
        if (document.getElementById("selectionsort-choice").checked)
            selectionsort(listToSort)
        else if (document.getElementById("insertionsort-choice").checked)
            insertionsort(listToSort);
        else if (document.getElementById("bubblesort-choice").checked)
            bubblesort(listToSort);
        else if (document.getElementById("mergesort-choice").checked)
            mergesort(listToSort);
        else if (document.getElementById("quicksort-choice").checked)
            quicksort(listToSort);
        else 
            heapsort(listToSort);
    }
    showsteps = true;
    outputDiv.innerHTML += outputHTML;
    outputHTML = "";
    outputDiv.innerHTML += "<p>List at end:</p>";
    output(listToSort);
    outputDiv.innerHTML += outputHTML;
    outputHTML = "";

    for (op in measurements) {
        if (measurements[op] > 0) {
            outputHTML += "<p>Number of " + op + ": " 
                + measurements[op] + "</p>";
            basicOps += measurements[op];
        }
    }
    outputDiv.innerHTML += outputHTML;
    outputHTML = "";
    outputDiv.innerHTML += "<p>Basic operations: " + basicOps + "</p>";
    document.getElementById("sort-button").disabled = false;
}

output = function(list, index1, index2, operation, truncate) {
    if (!showsteps) return 1;
    var text = "<p>";
    to = null != truncate ? truncate : list.length;
    for (var i=0; i<to; i++)  {
        if ( (null != index1 && i == index1) || 
             (null != index2 && i == index2) ) {
            text += "<span class='highlight-index' >";
            text += list[i] + "\t";
            text += "</span>";
        } else {
            text += list[i] + "\t";
        }
    }
    if (null != operation) 
        text += "<span class='operation'> &nbsp;" + 
        operation + "</span>";
    text += "</p>";
    outputHTML += text;
    return 1;
}

selectionsort = function(list) {
    for (var i = 0; i < list.length-1; i++) {
        var min = i;
        for (var j = i+1; j<list.length; j++) {
            if (++measurements["comparisons"] && 
                output(list, j, min, "Comparing") &&
                list[j] < list[min])
                min = j;            
        }
        ++measurements["swaps"];
        swap(list, i, min);
        output(list, i, min, "Swapped "+list[i]+" and "+ list[min]);
    }
}

insertionsort = function(list) {
    for (var i = 1; i<list.length; i++) {
        var v = list[i];
        var j = i - 1;

        while(j>=0 &&
              output(list, j, -1, ("finding place to left for " + v)) &&
              ++measurements["comparisons"] &&
              list[j] > v) {            
            ++measurements["moves"];
            list[j+1] = list[j];
            output(list, j, j+1, (list[j+1] + " > " + v + " so move it") );
            --j;
        }
        
        ++measurements["insertions"];
        list[j+1] = v;
        
        if (i != j+1)
            output(list, i, j+1, 
                   (v + " > than everything to left, so insert it"));
    }
};


bubblesort = function(list) {
    var sorted;
    for (var i = 0; i<list.length - 1; i++) {
        for (var j = 0; j<list.length-1-i; j++) {
            sorted = true;
            if (++measurements["comparisons"] && 
                output(list, j+1, j, "Comparing "+list[j]+" to "+list[j+1]) &&
                list[j+1] < list[j]) {
                sorted = false;
                ++measurements["swaps"];
                swap(list, j, j+1);
                output(list, j, j+1, "Swapped");
            }            
        }
        if (sorted) {
            output(list, -1, -1, "List is sorted. Finishing early.");
            break;
        }
    }
}

copy = function(A, from, to, C, insertpoint) {
    var j = insertpoint;
    for (var i=from; i<to; i++) {
        ++measurements["copies"];
        C[j] = A[i];
        j++;
    }
}

merge = function(B, C, A) {

    var i=0, j=0, k=0;
    var p = B.length, q = C.length;

    while(i<p && j<q) {
        if (++measurements["comparisons"] && B[i] <= C[j]) {
            output((B+","+"|,"+C).split(","), i, B.length+j+1, 
                   (B[i] + " <= ") + C[j]);
            ++measurements["moves"];
            A[k] = B[i];
            output(A, -1, -1, "Merged list so far: ", k);
            ++i;
        }
        else {
            output((B+","+"|,"+C).split(","), i, B.length+j+1, 
                   (B[i] + " > ") + C[j], k);
            ++measurements["moves"];
            A[k] = C[j];
            output(A, -1, -1, "Merged list so far: ");
            ++j;
        }
        ++k;
    }
    if (i == p)
        copy(C, j, C.length, A, k);
    else
        copy(B, i, B.length, A, k); 
    output(A, -1, -1, "After merge");
}


mergesort = function(A) {  

    if (A.length > 1) {
        var B = new Array();
        var C = new Array();
        copy(A, 0, Math.floor(A.length/2), B, 0);
        copy(A, Math.floor(A.length/2), A.length, C, 0);
        output(B, -1, -1, "Divide");
        mergesort(B);
        output(C, -1, -1, "Divide");
        mergesort(C);
        merge(B, C, A);
    }
}

swap = function(A, i1, i2) {
  var t = A[i1];
  A[i1] = A[i2];
  A[i2] = t;
}


hoarePartition = function(A, l, r) {

    var p = A[r];
    var i = l-1;
    var j = r;

    for(;;) {
        while(++measurements["comparisons"] && 
              output(A, i+1, r, ("Moving forward. Compare pivot " + p + " to " + A[i+1])) &&
              A[++i] < p);
        while(++measurements["comparisons"] && 
              output(A, j-1, r, ("Moving back. Compare pivot " + p + " to " + A[j-1])) &&
              p < A[--j]) 
            if (j==1) break;
        if (i >= j) break;
        output(A, i, j, "Before swap");
        ++measurements["swaps"];
        swap(A, i, j);
        output(A, i, j, "After swap");
    }
    output(A, i, r, "Before pivot swap");
    ++measurements["swaps"];
    swap(A, i, r);
    output(A, i, r, "After pivot swap");
    return i;
}


qsort = function(A, l, r) {
    if (l < r) {
        var s = hoarePartition(A, l, r);
        qsort(A, l, s-1);
        qsort(A, s+1, r);
    }
}

quicksort = function(A) {
    qsort(A, 0, A.length-1);
}


/* 
   Implementation of heap sort. 
   Code adapted from 
   http://www.iti.fh-flensburg.de/lang/algorithmen/sortieren/heap/heapen.htm
 */


downheap = function(A, v, n, desc) {
    var w=2*v+1;    // first descendant of v
    while (w<n) {
        if (w+1<n)    // is there a second descendant?
            if (output(A, w+1, w, desc + "Looking for 2nd descendent.") &&
                ++measurements["comparisons"] && 
                A[w+1]>A[w]) 
                w++;
        // w is the descendant of v with maximum label
        
        if (output(A, v, w, desc + "Checking for heap property.") &&
            ++measurements["comparisons"] &&
            A[v]>=A[w]) 
            return;  // v has heap property
        // otherwise        
        ++measurements["swaps"];
        swap(A, v, w);  // exchange labels of v and w
        output(A, v, w, desc + "After swap.")
        v=w;        // continue
        w=2*v+1;
    }
}



buildheap = function(A, n) {
    for (var v=Math.floor(n/2)-1; v>=0; v--)
        downheap(A, v, n, "In heap construction. ");    
}

heapsort = function(A) {
    var n=A.length;    
    buildheap(A, n);
    while (n>1) {
        n--;
        output(A, 0, n, "Before swap during maximum deletions.");
        swap(A, 0, n);
        output(A, 0, n, "After swap during maximum deletions.");
        downheap(A, 0, n, "Rebuilding heap in maximum deletions. ");
    }     
}



String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}