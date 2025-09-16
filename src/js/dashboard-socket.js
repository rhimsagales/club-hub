const generalSocket = io('/general');

function countActiveClubs(clubsData) {
    let count = 0;
    for (const clubId in clubsData) {
        if (clubsData[clubId].activeStatus) count++;
    }
    return count;
}

function countInactiveClubs(clubsData) {
    let count = 0;
    for (const clubId in clubsData) {
        if (!clubsData[clubId].activeStatus) count++;
    }
    return count;
}

function renderTotalActiveInactive(clubsData) {
    const activeCount = countActiveClubs(clubsData);
    const inactiveCount = countInactiveClubs(clubsData);
    document.getElementById('totalActiveClubs').textContent = activeCount;
    document.getElementById('totalInactiveClubs').textContent = inactiveCount;
}

function createClubRow(index, clubName, status, type, owner) {
  const tr = document.createElement("tr");
  tr.className = "h-16 even:bg-base-200 odd:bg-base-300";

  tr.innerHTML = `
    <th class="text-center w-[20%]">${index}</th>
    <td class="text-center w-[20%] cursor-pointer font-bold">
      <span>${clubName}</span>
    </td>
    <td class="text-center w-[20%] club-status-styling ${status=="Active"? "text-success" : "text-error"}">${status}</td>
    <td class="text-center w-[20%]">${type}</td>
    <td class="text-center w-[20%]">${owner}</td>
  `;

  document.querySelector('.dashboard-tbody').appendChild(tr);
}

function renderClubsTable(clubsData) {
    index = 1;
    document.querySelector('.dashboard-tbody').innerHTML = '';
    for(const clubId in clubsData) {
        const club = clubsData[clubId];
        const status = club.activeStatus ? "Active" : "Inactive";
        createClubRow(index, clubId, status, club.clubType, club.clubOwner);
        index++;
    }
}


generalSocket.on('all-clubs-data', (clubsData) => {
    renderTotalActiveInactive(clubsData);
    renderClubsTable(clubsData);
})