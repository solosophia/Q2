const getVersion = async () => {
    const response = await fetch('https://cws.auckland.ac.nz/QZ36C/Version',
        {
            headers: {
                "Accept": "application/json"
            },
        }
    );
    const data = await response.json();
    document.getElementById("version").innerHTML = `<b>version ${data}</b>`;
}
getVersion()

// const getDetails = async () => {
//     let response = await fetch('https://cws.auckland.ac.nz/QZ36C/Courses',
//         {
//             headers: {
//                 "Accept": "application/json"
//             },
//         }
//     );
//     const data = await response.json();
//     showDetails(data.data);
// }
// getDetails();

const getDetails = () => {
    let fetchPromise =  fetch('https://cws.auckland.ac.nz/QZ36C/Courses',
        {
            headers: {
                "Accept": "application/json"
            },
        }
    );
    const streamPromise = fetchPromise.then((response) => response.json());
    streamPromise.then((courses) => showDetails(courses.data));

}
getDetails();

// "id":"001377-1-2023","year":2023,"active":"Y","level":1,"feeBand":"SUC-PRM","crseId":"001377",
// "crseOfferNbr":1,"effdt":"2023-01-01","effdtOffer":"2023-01-01","acadCareer":"UC01","acadGroup":"4000",
// "acadOrg":"COMSCI","subject":"COMPSCI","catalogNbr":"101","titleLong":"Principles of Programming","title":
// "Principles of Programming","description":"A practical introduction to computers and computer programming in a high-level language. The course is lab-based and focuses on reading and writing computer programs. The course is intended for students who may wish to advance in Computer Science or in Information Systems and Operations Management.","catalogPrint":"Y","componentPrimary":"LEC","gradingBasis":"GRD","rqrmntGroup":"900956","rqrmntDescr":"Restriction: Cannot be taken with or after COMPSCI 105, 107, 130, 210-220, 230-289, 313-399",
// "splitOwner":"N","unitsAcadProg":15.0,"ssrComponent":"LEC","mainProgram":"BSC","effStatus":"A","microcredential":false}

const showDetails =  (courses) => {
    let htmlString = ""
    const showCourses =   (course) => {
        if (course.catalogPrint == "Y" && course.description != null) {
            htmlString += `<tr onclick="fetchClass(${course.catalogNbr})"><td><strong>COMPSCI ${course.catalogNbr}</strong><br>${course.titleLong}<br>${course.description}<br><br>${course.rqrmntDescr}</td></tr>`;
        }
    };
    courses.forEach(showCourses);
    const ourTable = document.getElementById("courseTable");
    ourTable.innerHTML = htmlString;
}

const fetchClass = (courseID) => {
    try {
        const fetchPromise =  fetch('https://cws.auckland.ac.nz/QZ36C/Classes?catalogNbr='+courseID, {
                headers: { "Content-type": "application/json", "Accept": "application/json"}
        });
        const streamPromise = fetchPromise.then((response) => response.json());
        streamPromise.then((courses) => showInfo(courses));
        
    } catch {
        showError();
    }
   
        
}
const showError = () => {
    const popup = document.getElementById("popup");
    popup.innerHTML = `<p>Sorry, the course timetable is not yet available.</p> <button onclick=hide("popup")>OK</button>`;
}

const showInfo = (courseInfo) => {
    let Information = "";
    for (let i = 2; i < 5; i++)
    Information += `${i}. ${courseInfo.data[i].meetingPatterns[0].daysOfWeek}
        ${courseInfo.data[i].meetingPatterns[0].startDate} - ${courseInfo.data[i].meetingPatterns[0].endDate} <br>
        ${courseInfo.data[i].meetingPatterns[0].startTime} - ${courseInfo.data[i].meetingPatterns[0].endTime} 
        <br>  
        ${courseInfo.data[i].meetingPatterns[0].location} 
        <br><br>` 
    

    const popup = document.getElementById("popup");
    popup.innerHTML = `<p>${Information}</p> <button onclick=hide("popup")>OK</button>`;
    popup.style.display = "block"

}


var hide = function(id) {
    document.getElementById(id).style.display = "none";
}
const classes = () => {
    document.getElementById("courses").style.display = "block";
    document.getElementById("infographics").style.display = "none";
}

const info = () => {
    document.getElementById("courses").style.display = "none";
    document.getElementById("infographics").style.display = "block";
}

let y = 1010;
let yMin = 0;
let x = 40;

let onlineStats = [];
let inPersonStats = [];
let dates = []; 

const getStats = async () => {
    const response = await fetch('https://cws.auckland.ac.nz/QZ36C/Stats',
        {
            headers: {
                "Accept": "application/json"
            },
        }
    );
    if (response.ok) {
        const data = await response.json()
        yAxis(data);
        drawDetails(data);
    }
}

const yAxis = (data) => {
    for (const entry of data) 
    {
        onlineStats.push(entry.online);
        inPersonStats.push(entry.inPerson);
        dates.push(entry.date);
    }
    y = (Math.max(...onlineStats)/4);
}

const drawDetails = async (data) => {
        let onlineLine = '<path stroke="#39C09A " stroke-width="8" d = "M ';
        let inPersonLine = '<path stroke="#062094 " stroke-width="8" d = "M ';
        const drawData = (data) => {
            onlineLine += `${x} ${y} L ${x} ${(y-(data.online/4))} M `;
            inPersonLine += `${x} ${y} L ${x} ${(y-(data.inPerson/4))} M `;
            x += 20;
        }
    data.forEach(drawData);
    onlineLine += '0 0" /> '
    inPersonLine += '0 0" />'
    
    let background = `<rect fill="white" x="-50" y="-50" height="${(y+100)}" width="${x+50}"/> `;
    let box = `<rect fill="none" x="30" y="-5" height="${(y+7)}" width="${x-40}" stroke="black" stroke-width="3px"/> `;
    const graph = document.getElementById("graph");
    
    let dateLabel = `<text  fill="black" class="text" x="35" y="10">${dates[0]}</text> 
                     <text  fill="black" class="text" x="${x-70}" y="10">${dates[dates.length-1]}</text>  `

    let numLabel = ` <text fill="black" class="text" x="5" y="${y}">${yMin}</text> 
                     <text fill="black" class="text" x="-5" y="10">${y*4}</text>  `
    let key = `<text fill="black" class="text" x="30" y="${y+20}">Online </text> 
               <line stroke="#39C09A " stroke-width="4px" stroke-linecap="round" x1="70" y1="${y+17}" x2="130" y2="${y+17}"/>
                <text fill="black" class="text" x="175" y="${y+20}">In Person</text>  
               <line stroke="#062094 "  stroke-width="4px" stroke-linecap="round" x1="225" y1="${y+17}" x2="285" y2="${y+17}"/>`
    graph.innerHTML = background + box + onlineLine + inPersonLine + dateLabel + numLabel + key;
    const sourceData = document.getElementById("sourceData");
    sourceData.innerHTML = `Online: ${onlineStats.join(" ")} <br> In Person: ${inPersonStats.join(" ")}`;
    }


getStats()