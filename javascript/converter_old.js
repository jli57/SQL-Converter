$(document).ready( function() {

	var newline = "&#13;&#10;"; 
	var countValue = { groupByField: 3, joinByField:3, compareByField:3}; 

	// for toggling groups
	$(".toggle").click( function toggleDisplay() {
		
			var fieldType = $(this).attr("id").replace("toggle", "") ; 
			var divIdName = "#"+fieldType ; 
			
			var val = $(divIdName).css("display"); 
			
			var change_from = "Add"; 
			var change_to = "Remove";
			
			if (  val === "none" ||   val === "") {
				$(divIdName).css("display", "block"); 				
			} else {
				$(divIdName).css("display", "none"); 
				change_from = "Remove"; 
				change_to = "Add"
			} 	
			$(this).text( function(i, v) {
					return v.replace(change_from, change_to); 
			}); 
		}
	); 
	// generate sql with grouping
	
	function compare_two_tables() {
		
		var tempTable = document.getElementById("tempTable").value; 
		var tableA = document.getElementById("tableA").value; 
		var tableB = document.getElementById("tableB").value; 
		
		var result = "This is the result"; 
		
		//add temp table statement
		var result =   "IF OBJECT_ID(\'tempdb..#" + tempTable + "') IS NOT NULL DROP TABLE #" + tempTable + ";" + newline; 
		
		var groupBy = getSQL( countValue["groupByField"], "groupByField" ); 
		var joinBy = getSQL( countValue["joinByField"], "joinByField" ); 
		
		result += 
			  "WITH a AS ( " + newline
			+ "SELECT "
			+ ( groupBy === "" ? "" : groupBy + ", " )
			+ "COUNT(1) AS cnt" + newline
			+ "FROM " + tableA + newline
			+ ( groupBy === "" ? "" : "GROUP BY " + groupBy + newline + "HAVING COUNT(1) > 1" + newline) 
			
			+ ")" + newline
			+ ", b AS (" + newline
			+ "SELECT " 
			+ ( groupBy === "" ? "" : groupBy + ", " )
			+ "COUNT(1) AS cnt" + newline
			+ "FROM " + tableB + newline
			
			+ ( groupBy === "" ? "" : "GROUP BY " + groupBy + newline + "HAVING COUNT(1) > 1" + newline) 
			
			+ ")" + newline
			
			// add select 
			+ "SELECT a.*, b.* " + newline
			+ "--INTO  #" + tempTable + newline
			+ "FROM a " + newline
			+ "FULL OUTER JOIN b ON "  
			+ getSQL( countValue["joinByField"], "joinByField" ) + newline
			// loop through comparison fields
			+ "WHERE ";
			
		result += getSQL( countValue["compareByField"], "compareByField"); 
		//structure for that includes group by 
		
		var divVal = document.getElementById("validationFields"); 
		if ( divVal.style.display === "block" ) {
			result = add_Validation( result, document.getElementById("testCase").value ); 
		}
		document.getElementById("result").innerHTML = result; 
	}

	function getSQL( num, fieldType ) {
		// add in comparison fields programmatically 
		var result = ""; 
		
		for ( i = 1; i <= num; i++ ) {
			var IsNull = ( fieldType === "groupByField" ? "" : document.getElementById( fieldType + "IsNull" + i.toString()).checked ); 
			var field = document.getElementById(fieldType + i.toString() ).value; 
			// make sure value is not empty
			if ( field !== "" ) {
				// do not insert common or AND if it's the first iteration
				if (i !== 1) {
					result +=( fieldType === "groupByField" ? ", " :  newline + "    AND "); 
				} 
				if ( fieldType === "groupByField") {
					result += field; 
				} else {
					result +=  (IsNull ? "ISNULL( a." + field + ", '-1') " : "a." + field )
					+ ( fieldType === "compareByField" ? " <> " : " = " ) 
					+ ( IsNull ? "ISNULL( b." + field + ", '-1') " : "b." + field ); 
				}
			}
			
		}
		return result
	}

	// loop through 
	function add_Fields(fieldType) {
		// maintiain values  
		var n = countValue[fieldType]; 

		var array = new Array(n); 
		for ( i = 1; i <= n; i++ ) {
			var div = document.getElementById(fieldType + i.toString());  
			if ( div.value !== "" ) {
				array[i-1] = div.value;
			}   
		}
		
		var countDiv = document.getElementById("add"+fieldType); 
		var count = 1; 
		if ( countDiv ) {
			count = countDiv.value ; 
		}
		
		for ( i = 1; i <= count; i++ ) {
			//countGroupByFieldsFields++; 
			var n = ++countValue[fieldType]; 
			appendToHTML( n, fieldType); 		
		}
		for ( i = 1; i <= n; i++ ) {
			var div = document.getElementById(fieldType + i.toString()); 
			if ( array[i-1] !== undefined ) {
				div.value = array[i-1];
			}   
		}
		
	}

	// actual append
	function appendToHTML( count, addType) {

		var newContent = ""; 
		var div = document.getElementById(addType+"s"); 
		if ( addType === "compareByField") {
			newContent = "<label>Comparison Field " + count.toString() + " </label><input type=\"text\"  class=\"userInput, field\"  id=\"compareByField" + count.toString() + "\" ></input> "
				+ "<label>Include ISNULL</label><input type=\"checkbox\" id=\"compareByFieldIsNull" + count.toString() + "\" checked></input>"
				+ "</br>"; 
		} else if ( addType === "groupByField") {
			newContent = "<label>Group By Field " + count.toString() + " </label><input type=\"text\"  class=\"userInput, field\"  id=\"groupByField" + count.toString() + "\" ></input> "
				+ "</br>"; 
		} else if ( addType === "joinByField" ) {
			newContent = "<label>Join Field " + count.toString() + " </label><input type=\"text\"  class=\"userInput, field\"  id=\"joinByField" + count.toString() + "\" ></input> "
				+ "<label>Include ISNULL</label><input type=\"checkbox\" id=\"joinByFieldIsNull" + count.toString() + "\" checked></input>"
				+ "</br>"; 
		}
		//alert(newContent);
		div.innerHTML += newContent; 
	}


	function toggleGroupBy() {
		var div = document.getElementById("groupByFields"); 
		//alert(div.style.display);  for testing purposes
		if ( div.style.display === "none" ||  div.style.display === "") {
			div.style.display = "block"; 
			document.getElementById("toggleGroupBy").innerHTML = "Remove Group By"; 
		} else {
			div.style.display = "none"; 
			document.getElementById("toggleGroupBy").innerHTML = "Add Group By"; 
		} 
	}

	function basic_compare() {
		var tempTable = document.getElementById("tempTable").value; 
		var tableA = document.getElementById("tableA").value; 
		var tableB = document.getElementById("tableB").value; 

		var result = "This is the result"; 
		var joinBy = getSQL( countValue["joinByField"], "joinByField" ); 
		var result = 
			  "IF OBJECT_ID(\'#tempdb.. " + tempTable + ") IS NOT NULL DROP TABLE #" + tempTable + ";" + " &#13;&#10;"
			+ "SELECT a.*, b.* " + newline
			+ "--INTO  " + tempTable + newline
			+ "FROM " + tableA + " AS a " + newline
			+ "FULL OUTER JOIN " + tableB + " as b "
			+ getSQL( countValue["joinByField"], "joinByField" ) + newline
			+ "WHERE ";
			
		result += getSQL( countValue["compareByField"], "compareByField"); 
		//structure for that includes group by 
		document.getElementById("result").innerHTML = result; 
		
	}

	function add_Validation(result, case_descr) {
		
		result = "SET @test_descr = '" + case_descr + "'; " + newline + result; 
		result += newline + newline + "IF EXISTS( SELECT * FROM " + document.getElementById("tempTable").value + ") " + newline
			+ "    INSERT INTO #validation VALUES( @test_descr, 0 ); " + newline
			+ "ELSE" + newline
			+ "    INSERT INTO #validation VALUES( @test_descr, 1 ); " + newline; 
		
		return result; 
	}


	function create_string_splitter_table() {
		
		var div = document.getElementById("result"); 
		var tempTable = document.getElementById("tempTable").value; 
		
		if ( tempTable == undefined || tempTable == "" ) {
			tempTable = "param_table"; 
		}
		
		var result = "DECLARE @param_str varchar(max) = '';" + newline
			+"IF OBJECT_ID(\'tempdb..#" + tempTable + "') IS NOT NULL DROP TABLE #" + tempTable + ";" + newline 
			+ "SELECT CAST(LTRIM(RTRIM(id))) AS id" + newline
			+ "INTO #" + tempTable + newline
			+ "FROM MART_SHARED.dbo.fnStringSplitter( @param_str, ',' );"
		
		div.innerHTML = result; 
		
	}

	function get_createTempTable(tempTableName) {
		var result =  "IF OBJECT_ID(\'tempdb..#" + tempTableName + "') IS NOT NULL DROP TABLE #" + tempTableName + ";" + newline; 
		return result; 
	}

	function get_dropTempTable(tempTableName) {
		var result = "DROP TABLE #" + tempTableName + ";" + newline; 
		return result
	}

	function parse_tempTable( statementType ) {
		var div = document.getElementById("input"); 
		//var tempTable = document.getElementById("tempTable").value; 
		var input = div.value; 
		var count = 0; 
		var result = ""; 
		 
		while ( input.indexOf("#") >= 0 && count < 100 ) {
			var end_index = input.indexOf("\n"); 
			var start_index = input.indexOf("#");
			if ( end_index === -1 ) {
				end_index = input.length; 
			}
			// logic for starting with create temp table statement; 
			var substr = input.substring(start_index+1, end_index); 
			if ( start_index < end_index &&  substr.indexOf("#") > -1 ) {
				start_index += substr.indexOf("#")+1; 
			} 
			// prevent infinite loop counter
			count++; 
			
			// only proceed if start index is larger than end index 
			if ( start_index < end_index ) {
				var tempTable = input.substring( start_index +1, end_index ).replace( ";" , "" ) ; 
				tempTable = $.trim(tempTable); 
				if ( statementType === "create" ) {
					result += get_createTempTable(tempTable); 
				} else if ( statementType === "drop" ) {
					result += get_dropTempTable(tempTable)
				}
			} 
			// truncate string 
			input = input.slice( end_index+1 ); 
		}
		//insert result into output text area 
		$("#result").html(result); 
		
	}

}); 