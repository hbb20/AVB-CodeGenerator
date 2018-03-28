var textAreaInput, textAreaOutput;
var views;
var initialized = false;
var cOutputMode = "cookieOutputMode";
var cAddPrefix = "cookieAddPrefix";
var cDoTypeCast ="cookieDoTypeCast";
var outputType = 1; //1: Activity 2: Fragment  3: ButterKnife 4: ButterKnifeLib
var liActivities, liFragments, liButterKnife, liButterKnifeLib, lis, chkAddPrefix, chkDoTypeCast;
/*This will set initial value for input and set output for the same. 
It sets event listener to inputArea so that on every change in inputText will regenerate output.
Then it focuses on inputArea so user can directly paste it with out additional click*/
function init() {
    textAreaInput = document.getElementById("textAreaInput");
    textAreaOutput = document.getElementById("textAreaOutput");
    liActivities = document.getElementById("li-activity");
    liFragments = document.getElementById("li-fragment");
    liButterKnife = document.getElementById("li-butterknife");
    liButterKnifeLib = document.getElementById("li-butterknifeLib");
    chkAddPrefix = document.getElementById("checkbox_add_prefix");
    chkDoTypeCast = document.getElementById("checkbox_do_type_cast");
    textAreaInput.value = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<RelativeLayout xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    xmlns:tools=\"http://schemas.android.com/tools\"\n    android:layout_width=\"match_parent\"\n    android:layout_height=\"match_parent\">\n\n    <LinearLayout\n        android:id=\"@+id/linear_parent\"\n        android:layout_width=\"match_parent\"\n        android:layout_height=\"match_parent\"\n        android:orientation=\"vertical\">\n\n       <EditText\n                    android:id=\"@+id/edittext_userName\"\n                    android:layout_width=\"match_parent\"\n                    android:layout_height=\"wrap_content\"/>\n\n        <EditText\n                    android:id=\"@+id/edittext_password\"\n                    android:layout_width=\"match_parent\"\n                    android:layout_height=\"wrap_content\"/>\n\n        <Button\n                android:id=\"@+id/button_login\"\n                android:layout_width=\"match_parent\"\n                android:layout_height=\"wrap_content\"/>\n</RelativeLayout>\n";
    textAreaInput.addEventListener("input", on_input_updated, false);

    lis = new Array();
    lis.push(liActivities);
    lis.push(liFragments);
    lis.push(liButterKnife);
    lis.push(liButterKnifeLib);
    set_do_type_cast_from_cookie();
    set_add_prefix_check_from_cookie();
    update_output_type(getOutputModeFromCookie());
    textAreaInput.focus();
}

function set_add_prefix_check_from_cookie() {
    var storedValue = getCookie(cAddPrefix);
    if (storedValue == "") {
        storedValue = "false";
    }

    if (storedValue == "false") {
        chkAddPrefix.checked = false;
    } else {
        chkAddPrefix.checked = true;
    }
}

function set_do_type_cast_from_cookie() {
    var storedCastValue = getCookie(cDoTypeCast);
    if (storedCastValue == "") {
        storedCastValue = "false";
    }

    if (storedCastValue == "false") {
        chkDoTypeCast.checked = false;
    } else {
        chkDoTypeCast.checked = true;
    }
}


function getOutputModeFromCookie() {
    var storedValue = getCookie(cOutputMode);
    if (storedValue == "") { //means no value stored
        return 1; //default is for activity output
    } else {
        return storedValue;
    }
}

function update_output_type(typeID) {
    outputType = typeID;
    for (var i = 0; i < lis.length; i++) {
        if (i + 1 == typeID) { //active type
            setCookie(cOutputMode, i + 1);
            lis[i].className = "li-custom active";
        } else {
            lis[i].className = "li-custom";
        }
    };
    updateOutput();
}

function on_input_updated() {
    if (initialized) {
        ga('send', 'inputUpdated');
    }
    updateOutput();
}

/*This will process on inputText and puts according output in output area.
 */
function updateOutput() {
    // initialize views array
    views = new Array();

    // checks inputText and fill views array
    readAllViews();


    // final output variable
    var finalResult = "";

    if (outputType == 1) {
        finalResult = getOutputForActivity();
    } else if (outputType == 2) {
        finalResult = getOutputForFragment();
    } else if (outputType == 3) {
        finalResult = getOutputForButterKnife();
    } else if (outputType == 4) {
        finalResult = getOutputForButterKnifeLib();
    }

    console.log("output is " + finalResult);


    //analytics
    if (initialized) {
        ga('send', 'event', 'codeGeneration', 'outPut updated', finalResult);
    }
    //sets final result to output
    textAreaOutput.value = finalResult;

    //sets foucus on output and select entire text of output. Now developer is only cltr + c press ways from copy the code.
    textAreaOutput.focus();

    //set flag
    initialized = true;
}


function getOutputForButterKnife() {
    var finalResult = "";
    console.log("I'm in function butterknife");
    //when atleast 1 view with android:id is found, appends output of each single view to finalResult
    if (views.length != 0) {
        finalResult = "/** ButterKnife Code **/";
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            var singleOutPut = getOutputLineForButterKnifeView(view);
            finalResult = finalResult + singleOutPut;
        }
        finalResult = finalResult + "\n /** ButterKnife Code **/"
    } else {
        finalResult = "/**No view found**/ ";
    }
    return finalResult;
}

function getOutputForButterKnifeLib() {
    var finalResult = "";
    console.log("I'm in function butterknife");
    //when atleast 1 view with android:id is found, appends output of each single view to finalResult
    if (views.length != 0) {
        finalResult = "/** ButterKnife Code **/";
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            var singleOutPut = getOutputLineForButterKnifeLibView(view);
            finalResult = finalResult + singleOutPut;
        }
        finalResult = finalResult + "\n /** ButterKnife Code **/"
    } else {
        finalResult = "/**No view found**/ ";
    }
    return finalResult;
}

function onCheckBoxClicked(argument) {
    if (initialized) {
        setCookie(cDoTypeCast, "True");
        setCookie(cAddPrefix, chkAddPrefix.checked);
    
        console.log("check box cast values"+chkAddPrefix.checked+":"+chkDoTypeCast.checked);
        console.log("prefix cast value:"+getCookie(cAddPrefix));
        console.log("Type cast value:"+getCookie(cDoTypeCast));
        updateOutput();
    }
}

function getOutputForActivity() {
    var finalResult = "Activity Output";
    var viewDeclaration = getViewDeclaration();
    var activityBinder = getActivityBinderCode();
    return viewDeclaration + "\n\n" + activityBinder;
}

function getOutputForFragment() {
    var finalResult = "Fragment output";
    var viewDeclaration = getViewDeclaration();
    var fragmentBinder = getFragmentBinderCode();
    return viewDeclaration + "\n\n" + fragmentBinder;
}

function getViewDeclaration() {
    var finalResult = "";
    if (views.length != 0) {
        finalResult = "/** Android Views **/";
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            var singleOutPut = getOutputLineForViewDeclaration(view);
            finalResult = finalResult + singleOutPut;
        }
        finalResult = finalResult + "\n /** Android Views **/"
    } else {
        finalResult = "/**No view found**/ ";
    }
    return finalResult;
}

function getActivityBinderCode() {
    var finalResult = "";
    if (views.length != 0) {
        finalResult = "/**\n * Binds XML views \n * Call this function after setContentView() in onCreate().\n**/ ";
        finalResult = finalResult + " \nprivate void bindViews(){"
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            var singleOutPut = getOutputLineForActivityBind(view);
            finalResult = finalResult + "\n" + singleOutPut;
        }
        finalResult = finalResult + "\n}"
    }
    return finalResult;
}

function getFragmentBinderCode() {
    var finalResult = "";
    if (views.length != 0) {
        finalResult = "/**\n * Binds XML views \n * Call this function after layout is ready.\n**/ ";
        finalResult = finalResult + " \nprivate void bindViews(View rootView){"
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            var singleOutPut = getOutputLineForFragmentBind(view);
            finalResult = finalResult + "\n" + singleOutPut;
        }
        finalResult = finalResult + "\n}"
    }
    return finalResult;
}

/*This will find each and every view from input text
  if the view has 'android:id=' then that view will be added to views*/
function readAllViews() {
    var xmlText = textAreaInput.value;
    var lastViewEnd = -1;
    while (lastViewEnd <= xmlText.length) {
        if (xmlText.indexOf("<", lastViewEnd + 1) > -1) {
            var viewBeginIndex = xmlText.indexOf("<", lastViewEnd + 1);
            var viewEndIndex = xmlText.indexOf(">", viewBeginIndex);
            if (viewBeginIndex > -1 && viewEndIndex > -1) {
                var view = xmlText.substring(viewBeginIndex, viewEndIndex + 1);
                if (isEligibleView(view)) {
                    views.push(view);
                }
                lastViewEnd = viewEndIndex;
            } else {
                break;
            }
        } else {
            break;
        }
    }
}


/*If view has "android:id" and className and id are not of length 0 then retun true or false otherwise.*/
function isEligibleView(view) {
    if (view.indexOf("android:id=") > -1) {
        if (getClassNameForView(view).trim().length > 0 && getIdFromView(view).trim().length > 0) {
            console.log("Eligibility: true=>" + view);
            return true;
        } else {
            console.log("Eligibility: false=>" + view);
            return false;
        }
    } else {
        console.log("Eligibility noID: false=>" + view);
        return false;
    }
}


/*
Returns output for single view.
this is sample oneViewXml
  <Button
    android:id="@+id/loginButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
  
  output will be=>
    @Bind(R.id.loginButton) 
    Button loginButton;

*/
function getOutputLineForButterKnifeView(oneViewXml) {
    // ga('send', 'event', 'Process', 'singleOutPut request', "");
    return "\n@BindView(R.id." + getIdFromView(oneViewXml).trim() + ") \n" + getClassNameForView(oneViewXml).trim() + " " + getJavaNameForView(oneViewXml).trim() + ";";
}


/*
Returns output for single view.
this is sample oneViewXml
  <Button
    android:id="@+id/loginButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
  
  output will be=>
    @BindView(R.id.loginButton) 
    Button loginButton;

*/
function getOutputLineForButterKnifeLibView(oneViewXml) {
    // ga('send', 'event', 'Process', 'singleOutPut request', "");
    return "\n@BindView(R2.id." + getIdFromView(oneViewXml).trim() + ") \n" + getClassNameForView(oneViewXml).trim() + " " + getJavaNameForView(oneViewXml).trim() + ";";
}

/*
Returns output for single view.
this is sample oneViewXml
  <Button
    android:id="@+id/loginButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
  
  output will be=>
    Button loginButton;

*/
function getOutputLineForViewDeclaration(oneViewXml) {
    // ga('send', 'event', 'Process', 'singleOutPut request', "");
    return "\n" + getClassNameForView(oneViewXml).trim() + " " + getJavaNameForView(oneViewXml).trim() + ";";
}

/*
Returns output for single view.
this is sample oneViewXml
  <Button
    android:id="@+id/login_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
  
  output will be=>
    loginButton = (Button)findViewById(R.id.login_button);

*/
function getOutputLineForActivityBind(oneViewXml) {
    // ga('send', 'event', 'Process', 'singleOutPut request', "");
    return "\t " + getJavaNameForView(oneViewXml).trim() + " = " + getClassNameForViewCast(oneViewXml).trim() + " findViewById(R.id." + getIdFromView(oneViewXml).trim() + ");";
}

/*
Returns output for single view.
this is sample oneViewXml
  <Button
    android:id="@+id/login_button"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"/>
  
  output will be=>
    loginButton = (Button)rootView.findViewById(R.id.login_button);

*/
function getOutputLineForFragmentBind(oneViewXml) {
    // ga('send', 'event', 'Process', 'singleOutPut request', "");
    return "\t " + getJavaNameForView(oneViewXml).trim() + " = " + getClassNameForViewCast(oneViewXml).trim() + " rootView.findViewById(R.id." + getIdFromView(oneViewXml).trim() + ");";
}


/*this will return class name from xml view
sample view
<Button
  android:id="@+id/loginButton"
  android:layout_width="match_parent"
  android:layout_height="wrap_content"/>

returns=>
"Button"

*/
function getClassNameForView(oneViewXml) {
    var output;
    var firstAngularIndex = oneViewXml.indexOf("<");
    if (firstAngularIndex > -1) {
        var firstSpaceIndex = oneViewXml.indexOf(" ", firstAngularIndex);
        output = oneViewXml.substring(firstAngularIndex + 1, firstSpaceIndex);
        return output;
    }
    return "Object";
}

/**
 * If typecasting is enabled, then returns class with () otherwise none
 * @param {XML View} oneViewXml 
 */
function getClassNameForViewCast(oneViewXml) {
    if(chkDoTypeCast.checked){
        return "("+getClassNameForView(oneViewXml).trim()+")";
    }else{
        return "";
    }
}


/*this will return ID from xml view
sample view
<Button
  android:id="@+id/login_button"
  android:layout_width="match_parent"
  android:layout_height="wrap_content"/>

returns=>
"login_button"
*/
function getIdFromView(oneViewXml) {
    if (oneViewXml.indexOf("android:id=") > -1) {
        var lineBegin = oneViewXml.indexOf("android:id=");
        var lineFirstComma = oneViewXml.indexOf('/', lineBegin);
        var lineLastComma = oneViewXml.indexOf('"', lineFirstComma + 1);
        var outPut = lineBegin + ":linebegin  " + lineFirstComma + ":lineFirstComma  " + lineLastComma + ":lineLastComma";
        outPut = oneViewXml.substring(lineFirstComma + 1, lineLastComma);
        return outPut;
    } else {
        return "";
    }
}

/*this will return javaname from xml view
sample view
<Button
  android:id="@+id/login_button"
  android:layout_width="match_parent"
  android:layout_height="wrap_content"/>

returns=>
"loginButton"
if add m prefix is selected, it will be mLoginButton
*/
function getJavaNameForView(oneViewXml) {
    var xmlId = getIdFromView(oneViewXml).trim();
    if (chkAddPrefix.checked) {
        xmlId = "m_" + xmlId;
    }
    var javaName = "";
    var underScoreIndex = xmlId.indexOf("_");

    if (underScoreIndex == -1) { //no '_' in id then use id as name
        javaName = xmlId;
    } else {
        var tokens = xmlId.split("_");
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i].trim();
            if (token.length > 0) {
                var firstChar = token.charAt(0);
                var capToken = "";
                if (javaName.length == 0) {
                    capToken = token;
                } else {
                    capToken = firstChar.toUpperCase() + token.slice(1);
                }

                javaName = javaName + capToken;
            }
        }
    }
    // ga('send', 'event', 'Process', 'javaname generation', "xmlId:" + xmlId + "; javaName:" + javaName);
    return javaName;
}


// get cookie and set cookie code is from w3schools
function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000)); //30 days
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
