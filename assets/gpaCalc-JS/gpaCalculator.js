// GPA Calculator
// Lane Moseley, 12/13/2018


function addRow( ) {
    var cell1, cell2, cell3, cid, gid, id, newRow;
    var rows = document.getElementById( "theTable" ).rows.length;
    var table = document.getElementById( "theTable" );

    newRow = table.insertRow( rows - 1) ;
    cell1 = newRow.insertCell( 0 );
    cell2 = newRow.insertCell( 1 );
    cell3 = newRow.insertCell( 2 );

    id = ( rows - 3 );
    cid = "c" + id;
    gid = "g" + id;

    cell1.innerHTML = "Class #" + id + ":";
    cell2.innerHTML = "<input type=\"number\" id=" + cid + " value=\"0\">";
    cell3.innerHTML = "<input type=\"text\" id=" + gid + " value=\"A\">";
}

function calculateGPA( ) {
    var cummulative = 0.00;
    var i = 0;
    var nums = [];
    var rows = document.getElementById( "theTable" ).rows.length - 4;
    var totalCredits = Number(document.getElementById( "credits" ).value);
    var totalPoints = Number(document.getElementById( "gpa" ).value) * totalCredits;

    getGrades( nums, rows );

    for ( i = 0; i < rows; ++i ) {
        totalCredits += Number( document.getElementById( "c" + ( i + 1 ) ).value );
        totalPoints += document.getElementById( "c" + ( i + 1 ) ).value * nums[i];
    }

    if ( totalCredits != 0 ) {
        cummulative = ( totalPoints / totalCredits );
    }

    document.getElementById( "results" ).innerHTML = "<td>Total Credits: " + totalCredits + "</td>"
                                                        + "<td>New GPA: " + cummulative.toPrecision( 3 ) + "</td>";
}

function deleteRow( ) {
    var length = document.getElementById( "theTable" ).rows.length;
    var index = length - 2

    if (length > 7) {
        document.getElementById( "theTable" ).deleteRow( index );
    }
}

function getGrades( nums, rows ) {
    var letters = [];

    for (i = 0; i < rows; ++i) {
        letters.push(document.getElementById( "g" + ( i + 1 ) ).value);

        if ( Number( letters[i] ) > -1 && Number( letters[i] < 5 ) ) {
            nums.push( Number( letters[i] ) );
        }
        else if ( letters[i] == "A" ) {
            nums.push( 4.0 );
        }
        else if ( letters[i].toUpperCase( ) == "B" ) {
            nums.push( 3.0 );
        }
        else if ( letters[i].toUpperCase( ) == "C" ) {
            nums.push( 2.0 );
        }
        else if ( letters[i].toUpperCase( ) == "D" ) {
            nums.push( 1.0 );
        }
        else if ( letters[i].toUpperCase( ) == "F" ) {
            nums.push( 0.0 );
        }
        else {
            alert("Invalid input for class " + (i + 1) + " grade.");
            nums.push( 0.0 );
        }
    }
}

function reset( ) {
    location.reload( );
}