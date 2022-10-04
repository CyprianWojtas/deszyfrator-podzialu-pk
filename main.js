let re = /^\s*(?<subject>.+?)(?: (?<group>[LKĆPW]\S*?))?(?:-\(?(?<week>[NnPp])\)?\d*)? (?<lecturer>\S+) (?<room>.+)\s*$/m;

let groups = {};
let groupsDiv = document.querySelector(".groups");
let weekSelect = document.querySelector(".week");
let table = undefined;

async function loadTimetable(url)
{
	groups = {};

	let bodyStr = await (await fetch(url)).text();
	let dom = new DOMParser().parseFromString(bodyStr, "text/html");

	groupsDiv.innerHTML = "";
	if (table)
		table.remove();
	
	table = dom.querySelector("table.tabela");
	document.querySelector(".title").innerHTML = dom.querySelector(".tytulnapis").innerHTML;

	document.querySelector(".table").append(table);

	for (let cell of table.querySelectorAll("td.l"))
	{
		subjectsHTML = "";
		for (let subjectHTML of cell.innerHTML.split("<br>"))
		{
			subjectsHTML += `<div>${subjectHTML}</div>`;
		}
		cell.innerHTML = subjectsHTML;

		
		for (let aEl of cell.getElementsByTagName("a"))
		{
			aEl.href = `http://podzial.mech.pk.edu.pl/stacjonarne/html/plany/${aEl.attributes.href.nodeValue}`;
			aEl.target = "_blank";
		}

		for (let subjectDiv of cell.childNodes)
		{
			let subject = subjectDiv.innerText.match(re);
			if (!subject)
				continue;
			
			let subj = subject.groups;
			
			// Pobieranie grup
			if (subj.group)
			{
				let type = subj.group[0];
				if (!groups[type])
					groups[type] = new Set();
				
				groups[type].add(subj.group);
			}
		}
	}

	let hashGroups = [];

	if (location.hash)
		hashGroups = decodeURIComponent(location.hash.substr(1)).split(",");
	
	if (hashGroups[0] == "P" || hashGroups[0] == "N")
	{
		weekSelect.value = hashGroups[0];
		hashGroups.shift();
	}
	

	for (let group of Object.keys(groups).sort())
	{
		let groupsGroupDiv = document.createElement("div");

		let subgroups = [...groups[group]].sort();

		for (let subgroup of subgroups)
		{
			let label = document.createElement("label");
			let input = document.createElement("input");
			input.type = "checkbox";
			input.name = subgroup;
			if (hashGroups.includes(subgroup))
				input.checked = true;
			
			input.addEventListener("input", updateFilters);

			label.append(input, subgroup);

			groupsGroupDiv.append(label);
		}

		groupsDiv.append(groupsGroupDiv);
	}

	updateFilters();
}

function updateFilters()
{
	let wv = weekSelect.value;
	let selectedGroups = [];
	for(let group of groupsDiv.querySelectorAll("input"))
	{
		if (group.checked)
			selectedGroups.push(group.name);
	}

	location.hash = [wv, ...selectedGroups].join(",");

	for (let cell of table.querySelectorAll("td.l"))
	{
		for (let subjectDiv of cell.childNodes)
		{
			let subject = subjectDiv.innerText.match(re);
			if (!subject)
				continue;
			
			let subj = subject.groups;
			
			if ((!subj.week || subj.week.toUpperCase() == wv) && (selectedGroups.includes(subj.group) || !subj.group))
			{
				subjectDiv.classList.remove("greyed");
			}
			else
			{
				subjectDiv.classList.add("greyed");
			}
		}
	}
}

weekSelect.addEventListener("input", updateFilters);

let plan = "html/plany/o31.html";
loadTimetable(plan);

// ============================== \\
// ===== Loading plans list ===== \\
// ============================== \\
let timetablesEl = document.querySelector("aside");

async function loadTimetablesList(url)
{
	let bodyStr = await (await fetch(url)).text();
	let dom = new DOMParser().parseFromString(bodyStr, "text/html");
	
	for (let oddzial of dom.querySelectorAll("#oddzialy .el > a"))
	{
		let oddzialEl = document.createElement("a");
		oddzialEl.href = "#" + oddzial.innerText;
		oddzialEl.append(oddzial.innerText);
		
		oddzialEl.addEventListener("click", e =>
		{
			e.preventDefault();
			loadTimetable("html/" + oddzial.attributes.href.nodeValue);
		});

		timetablesEl.append(oddzialEl);
	}
}

loadTimetablesList("html/lista.html");
