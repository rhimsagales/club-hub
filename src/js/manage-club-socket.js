// Generate club tasks button logic

// Store latest club data for modal injection
let latestClubData = null;
// manage-club-socket.js
// Handles login, socket.io connection, and club data injection for manage-club.html

// Save changes for Additional Info form
document.addEventListener('DOMContentLoaded', function() {
    // Create Event form logic
    const createEventForm = document.querySelector('#createEventModal form');
    if (createEventForm) {
        createEventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const eventName = createEventForm.querySelector('input[type="text"]').value.trim();
            const eventType = createEventForm.querySelector('select').value;
            const eventDate = createEventForm.querySelector('input[type="date"]').value;
            const eventTime = createEventForm.querySelector('input[type="time"]').value;
            // Get clubName from latestClubData
            const clubName = window.latestClubData?.clubName;
            if (!clubName || !eventName || !eventType || !eventDate || !eventTime) {
                alert('Please fill in all event fields.');
                return;
            }
            try {
                await fetch('/api/create-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName, eventName, eventType, eventDate, eventTime })
                });
                if (typeof createEventModal !== 'undefined') createEventModal.close();
            } catch (err) {
                alert('Failed to create event.');
            }
        });
    }
    const additionalInfoForm = document.querySelector('#additionalInfoModal form');
    if (additionalInfoForm) {
        additionalInfoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const goals = additionalInfoForm.elements['goals'].value.trim();
            const requirements = additionalInfoForm.elements['requirements'].value.trim();
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: window.clubUsername,
                        goals,
                        requirements
                    })
                });
                if (typeof additionalInfoModal !== 'undefined') additionalInfoModal.close();
            } catch (err) {
                alert('Failed to save additional info.');
            }
        });
    }

    // Save changes for Contact Info form
    const contactInfoForm = document.querySelector('#contactInfoModal form');
    if (contactInfoForm) {
        contactInfoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const phone = contactInfoForm.elements['phone'].value.trim();
            const email = contactInfoForm.elements['email'].value.trim();
            const socialMedia = contactInfoForm.elements['socialMedia'].value.trim();
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: window.clubUsername,
                        phone,
                        email,
                        socialMedia
                    })
                });
                if (typeof contactInfoModal !== 'undefined') contactInfoModal.close();
            } catch (err) {
                alert('Failed to save contact info.');
            }
        });
    }

    // Member Recruit switch logic
    const memberRecruitSwitch = document.getElementById('clubMemberRecruitSwitch');
    if (memberRecruitSwitch) {
        memberRecruitSwitch.addEventListener('change', async function() {
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: window.clubUsername,
                        memberRecruitment: !!memberRecruitSwitch.checked
                    })
                });
            } catch (err) {
                alert('Failed to update member recruitment status.');
            }
        });
    }

    // Status switch logic
    const statusSwitch = document.getElementById('clubStatusToggle');
    if (statusSwitch) {
        statusSwitch.addEventListener('change', async function() {
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: window.clubUsername,
                        activeStatus: !!statusSwitch.checked
                    })
                });
            } catch (err) {
                alert('Failed to update club status.');
            }
        });
    }
});

// Event listener for Edit Club Information form
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editClubForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Edit Club Information form submit event triggered');
            // Collect form data
            const updated = {
                clubName: document.getElementById('editClubName').value.trim(),
                clubType: document.getElementById('editClubType').value,
                clubNumber: document.getElementById('editClubNumber').value.trim(),
                email: document.getElementById('editClubEmail').value.trim(),
            };
            // Send to backend
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: window.clubUsername, ...updated })
                });
                location.reload(); // Reload to reflect changes, especially if clubName changed
            } catch (err) {
                alert('Failed to save changes.');
            }
        });
    }

    // Settings form saving logic
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Settings form submit event triggered');
            // Collect form data
            const updated = {
                maxMembers: document.getElementById('settingsMaxMembers').value,
                meetingLocation: document.getElementById('settingsMeetingLocation').value.trim(),
                meetingFrequency: document.getElementById('settingsMeetingFrequency').value,
            };
            // Send to backend
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: window.clubUsername, ...updated })
                });
                // Optionally close modal if present
                if (typeof settingsModal !== 'undefined') settingsModal.close();
            } catch (err) {
                alert('Failed to save settings.');
            }
        });
    }
});

// Club login modal logic with socket.io

function renderEvents(name, date, time, type, color) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'p-4 bg-base-200 rounded-lg aspect-square';

    const circleNameContainer = document.createElement('div');

    circleNameContainer.className = 'flex items-center mb-2';

    circleDiv = document.createElement('div');
    circleDiv.className = `w-3 aspect-square rounded-full mr-2 ${color}`;

    const nameEl = document.createElement('h3');
    nameEl.className = 'text-lg font-semibold';
    nameEl.textContent = name;

    circleNameContainer.appendChild(circleDiv);
    circleNameContainer.appendChild(nameEl);
    mainDiv.appendChild(circleNameContainer);

    const dateEl = document.createElement('p');
    dateEl.className = 'text-xs text-base-content/70';
    dateEl.textContent = `${date} | ${time}`;
    
    const typeEl = document.createElement('p');
    typeEl.className = 'text-xs mt-1';
    typeEl.textContent = type;

    mainDiv.appendChild(dateEl);
    mainDiv.appendChild(typeEl);
    
    document.querySelector('.event-container').appendChild(mainDiv);


}

function countActiveInactiveClubs(clubs) {
    let activeCount = 0;
    let inactiveCount = 0;
}

function createMemberCard({ fullName, email, role = '' }) {
    // Extract initials (e.g., "John Doe" -> "JD")
    const initials = fullName.split(' ').map(namePart => namePart.charAt(0).toUpperCase()).join('');

    // Create card element
    const card = document.createElement('div');
    card.className = 'card bg-base-200 p-4';
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="avatar w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                    ${initials}
                </div>
                <div>
                    <h4 class="font-semibold">${fullName}</h4>
                    <p class="text-sm text-base-content/70">${email}</p>
                    <input 
                        type="text" 
                        placeholder="Role" 
                        value="${role}" 
                        class="input input-sm input-bordered mt-1 w-full max-w-xs member-role-input" 
                        />
                </div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-sm btn-success btn-outline accept-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                </button>
                <button class="btn btn-sm btn-error btn-outline reject-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                </button>
            </div>
        </div>
    `;

    // Add event listeners for Accept/Reject
    const acceptBtn = card.querySelector('.accept-btn');
    const rejectBtn = card.querySelector('.reject-btn');
    const roleInput = card.querySelector('.member-role-input');

    acceptBtn.addEventListener('click', async () => {
        const roleValue = roleInput.value.trim();
        const clubName = window.latestClubData?.clubName;
        if (!clubName) {
            alert('Club name not found.');
            return;
        }
        try {
            const res = await fetch('/api/accept-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName, email, role: roleValue, clubName })
            });
            const result = await res.json();
            if (result.success) {
                alert('Member accepted successfully.');
                card.remove();
            } else {
                alert(result.message || 'Failed to accept member.');
            }
        } catch (err) {
            alert('Error accepting member.');
        }
    });

    rejectBtn.addEventListener('click', async () => {
            const clubName = window.latestClubData?.clubName;
            if (!clubName) {
                alert('Club name not found.');
                return;
            }
            try {
                const res = await fetch('/api/reject-member', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: fullName, email, clubName })
                });
                const result = await res.json();
                if (result.success) {
                    alert('Member rejected and removed.');
                    card.remove();
                } else {
                    alert(result.message || 'Failed to reject member.');
                }
            } catch (err) {
                alert('Error rejecting member.');
            }
    });

    return card;
}

function createTaskItem(taskText) {
  return `
    <div class="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
      <div class="w-2 h-2 bg-primary rounded-full"></div>
      <span class="text-sm flex-1">${taskText}</span>
    </div>
  `;
}


function startClubSocket(){

} 

document.addEventListener('DOMContentLoaded', () => {
    const clubLoginModal = document.getElementById('clubLoginModal');
    const clubLoginForm = document.getElementById('clubLoginForm');
    if (clubLoginModal && clubLoginForm) {
        clubLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginClubPassword').value;
            // Send credentials to backend for validation
            try {
                const res = await fetch('/api/club-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const result = await res.json();
                if (!result.success) {
                    // Wrong credentials, reload page and show modal again
                    alert('Wrong/Not existing credentials. Please try again.')
                    window.location.reload();
                } else {
                    // Credentials correct, close modal and connect socket
                    clubLoginModal.close();
                    window.clubUsername = username;
                    window.latestClubData = {
                        clubName: result.clubName
                    };
                    connectClubSocket(username);
                }
            } catch (err) {
                alert('Login failed. Please try again.');
                window.location.reload();
            }
        });
    }

    

    // Save changes for Club Description form
    const descForm = document.querySelector('#editDescriptionModal form');
    if (descForm) {
        descForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const clubDescription = descForm.querySelector('textarea').value.trim();
            try {
                await fetch('/api/update-club', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: window.clubUsername,
                        clubDescription
                    })
                });
                if (typeof editDescriptionModal !== 'undefined') editDescriptionModal.close();
            } catch (err) {
                alert('Failed to save club description.');
            }
        });
    }

    // Attach event listener to Delete Club button
    const deleteBtn = document.querySelector('.btn-error[onclick="deleteClub()"]');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
            const clubName = window.latestClubData?.clubName;
            if (!clubName) {
                alert('Club name not found.');
                return;
            }
            if (!confirm(`Are you sure you want to delete the club: ${clubName}? This action cannot be undone.`)) {
                return;
            }
            try {
                const res = await fetch('/api/delete-club', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName })
                });
                const result = await res.json();
                if (result.success) {
                    alert('Club deleted successfully.');
                    window.location.href = '/'; // Redirect to home or another page
                } else {
                    alert(result.message || 'Failed to delete club.');
                }
            } catch (err) {
                alert('Error deleting club.');
            }
        });
    }
});

// Socket.io connection and club data listener
function connectClubSocket(username) {
    // Load socket.io client script from CDN if not loaded
    if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
        script.onload = () => {
            startSocket(username);
        };
        document.body.appendChild(script);
    } else {
        startSocket(username);
    }
}

function startSocket(username) {
    const socket = io('/clubOwners');
    socket.emit('club-login', { username });
    socket.on('club-data', (clubData) => {
        // TODO: Inject clubData into UI, replacing dummy/placeholder data
        injectClubData(clubData);
    });
    socket.on('club-login-failed', () => {
        // If server rejects login, reload and prompt again
        window.location.reload();
    });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

const colors = ['bg-sucess', 'bg-error', 'bg-warning', 'bg-info', 'bg-primary', 'bg-secondary', 'bg-accent'];
let generateTasksHandler = null;
// Replace placeholder data with real club data
function injectClubData(clubData) {
    // Inject data into Club Description form textarea
    const descForm = document.querySelector('#editDescriptionModal form');
    if (descForm) {
        const descTextarea = descForm.querySelector('textarea');
        if (descTextarea) descTextarea.value = clubData.clubDescription || '';
    }
    
    // Additional Info Modal fields
    const goalsField = document.querySelector('#additionalInfoModal [name="goals"]');
    if (goalsField) goalsField.value = clubData.goals || '';
    const requirementsField = document.querySelector('#additionalInfoModal [name="requirements"]');
    if (requirementsField) requirementsField.value = clubData.requirements || '';

    // Contact Info Modal fields
    const phoneField = document.querySelector('#contactInfoModal [name="phone"]');
    if (phoneField) phoneField.value = clubData.phone || '';
    const emailField = document.querySelector('#contactInfoModal [name="email"]');
    if (emailField) emailField.value = clubData.email || '';
    const socialMediaField = document.querySelector('#contactInfoModal [name="socialMedia"]');
    if (socialMediaField) socialMediaField.value = clubData.socialMedia || '';

    // Member Recruit switch (boolean)
    const memberRecruitSwitch = document.getElementById('clubMemberRecruitSwitch');
    if (memberRecruitSwitch) memberRecruitSwitch.checked = !!clubData.memberRecruitment;

    // Status switch (boolean)
    const statusSwitch = document.getElementById('clubStatusToggle');
    if (statusSwitch) statusSwitch.checked = !!clubData.activeStatus;
    // Also update status label if present
    const statusLabel = document.getElementById('clubStatusLabel');
    if (statusLabel) statusLabel.textContent = clubData.activeStatus ? 'Active' : 'Inactive';
    // Only inject data into UI panels
    if (!clubData) return;
    // Club description
    const descEl = document.querySelector('.club-description-text');
    if (descEl) descEl.textContent = clubData.clubDescription || 'No description available.';

    // Club owner
    const ownerNameEl = document.querySelector('.club-owner-name');
    if (ownerNameEl) ownerNameEl.textContent = clubData.clubOwner || 'N/A';

    const ownerEmailEl = document.querySelector('.club-owner-email');
    if (ownerEmailEl) ownerEmailEl.textContent = clubData.email || 'N/A';

    const ownerInitialsEl = document.querySelector('.club-owner-initials');
    if (ownerInitialsEl) {
        let initials = '?';
        if (clubData.clubOwner && typeof clubData.clubOwner === 'string') {
            const parts = clubData.clubOwner.trim().split(' ');
            initials = parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : parts[0][0].toUpperCase();
        }
        ownerInitialsEl.textContent = initials;
    }

    // Club info panel
    const clubNameEl = document.querySelector('.club-info-name');
    if (clubNameEl) clubNameEl.textContent = clubData.clubName || 'N/A';

    const clubTypeEl = document.querySelector('.club-info-type');
    if (clubTypeEl) clubTypeEl.textContent = clubData.clubType || 'N/A';

    const clubPhoneEl = document.querySelector('.club-info-phone');
    if (clubPhoneEl) clubPhoneEl.textContent = clubData.phoneNumber || 'N/A';

    const clubSocialEl = document.querySelector('.club-info-social');
    if (clubSocialEl) clubSocialEl.textContent = clubData.socialMedia || 'N/A';

    const clubMaxEl = document.querySelector('.club-info-max');
    if (clubMaxEl) clubMaxEl.textContent = clubData.maxMembers ? `Max ${clubData.maxMembers} members` : 'N/A';

    const clubLocationEl = document.querySelector('.club-info-location');
    if (clubLocationEl) clubLocationEl.textContent = clubData.meetingLocation || 'N/A';

    const clubStatusBadge = document.querySelector('.club-info-status');
    if (clubStatusBadge) {
        if (clubData.activeStatus) {
            clubStatusBadge.textContent = 'Active';
            clubStatusBadge.classList.add('badge-success');
            clubStatusBadge.classList.remove('badge-error');
        } else {
            clubStatusBadge.textContent = 'Inactive';
            clubStatusBadge.classList.add('badge-error');
            clubStatusBadge.classList.remove('badge-success');
        }
    }

    // Members panel
    const membersListEl = document.querySelector('.club-members-list');
    if (membersListEl) {
        membersListEl.innerHTML = '';
        const membersObj = clubData.members;
        if (membersObj && typeof membersObj === 'object' && Object.keys(membersObj).length > 0) {
            // Object.entries(membersObj).forEach(([role, name]) => {
            //     let initials = '?';
            //     if (typeof name === 'string' && name.trim()) {
            //         const parts = name.trim().split(' ');
            //         initials = parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : parts[0][0].toUpperCase();
            //     }
            //     const memberDiv = document.createElement('div');
            //     memberDiv.className = 'flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg';
            //     memberDiv.innerHTML = `
            //         <div class="avatar w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold">${initials}</div>
            //         <div class="flex-1">
            //             <p class="font-medium text-sm">${name || 'N/A'}</p>
            //             <p class="text-xs text-base-content/70">${role}</p>
            //         </div>
            //     `;
            //     membersListEl.appendChild(memberDiv);
            // });

                for(const member of Object.values(membersObj)) {
                    if (!member.pending) {
                        let initials = '?';
                        if (typeof member.name === 'string' && member.name.trim()) {
                            const parts = member.name.trim().split(' ');
                            initials = parts.length > 1 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : parts[0][0].toUpperCase();
                        }
                        const memberDiv = document.createElement('div');
                        memberDiv.className = 'flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg';
                        memberDiv.innerHTML = `
                            <div class="avatar w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold">${initials}</div>
                            <div class="flex-1">
                                <p class="font-medium text-sm">${member.name || 'N/A'}</p>
                                <p class="text-xs text-base-content/70">${member.role || 'Member'}</p>
                            </div>
                        `;
                        membersListEl.appendChild(memberDiv);
                    }
                    
                }

            // Inject total count of members into header
            const membersHeader = document.querySelector('.members-count-header');
            if (membersHeader) {
                membersHeader.textContent = `Members (${Object.values(membersObj).filter(member => !member.pending).length})`;
            }
        } else {
            membersListEl.innerHTML = '<div class="text-sm text-base-content/70">No members found.</div>';
            // Inject zero count if no members
            const membersHeader = document.querySelector('.members-count-header');
            if (membersHeader) {
                membersHeader.textContent = 'Members (0)';
            }
        }
    }

    // Inject data into Edit Club form fields
    const editClubName = document.getElementById('editClubName');
    if (editClubName) editClubName.value = clubData.clubName || '';
    const editClubType = document.getElementById('editClubType');
    if (editClubType) editClubType.value = clubData.clubType || '';
    const editClubNumber = document.getElementById('editClubNumber');
    if (editClubNumber) editClubNumber.value = clubData.clubNumber || '';
    const editClubEmail = document.getElementById('editClubEmail');
    if (editClubEmail) editClubEmail.value = clubData.email || '';

    // Inject data into Settings form fields
    const settingsMaxMembers = document.getElementById('settingsMaxMembers');
    if (settingsMaxMembers) settingsMaxMembers.value = clubData.maxMembers || '';
    const settingsMeetingLocation = document.getElementById('settingsMeetingLocation');
    if (settingsMeetingLocation) settingsMeetingLocation.value = clubData.meetingLocation || '';
    const settingsMeetingFrequency = document.getElementById('settingsMeetingFrequency');
    if (settingsMeetingFrequency) settingsMeetingFrequency.value = clubData.meetingFrequency || '';


    //Render events
    if (clubData.events && typeof clubData.events === 'object' && Object.keys(clubData.events).length > 0) {
        document.querySelector('.event-container').innerHTML = '';

        Object.values(clubData.events).forEach(event => {
        renderEvents(event.eventName, event.eventDate, event.eventTime, event.eventType, colors[getRandomInt(0, colors.length - 1)]);
    })
    }

    //Render Hostname and clubname for student dashboard url
    const hostnameEl = document.querySelector('.club-join-url-hostname');
    const hostName = window.location.host ;

    hostnameEl.value = `http://${hostName}/student-dashboard/${btoa((clubData.clubName).replace(/\s+/g, '-'))}`;

    const applicantListEl = document.getElementById('applicantList');
    if (applicantListEl) {
        applicantListEl.innerHTML = '';
        const membersObj = clubData.members;
        if (Object.values(membersObj).filter(members => members.pending).length > 0) {
            Object.values(membersObj).forEach(member => {
                if (member.pending) {
                    const card = createMemberCard({fullName: member.name, email: member.email});
                    applicantListEl.appendChild(card);
                }
            });
        } else if(Object.values(membersObj).filter(members => members.pending).length === 0){ 
            applicantListEl.innerHTML = '<div class="text-sm text-base-content/70">No applicants found.</div>';
        }
    }

    
    const generateBtn = document.getElementById('generateTasksBtn');
    if (generateBtn) {
        if (generateTasksHandler) {
            generateBtn.removeEventListener('click', generateTasksHandler);
        }
        // Create a new handler with the current clubData
        generateTasksHandler = async function() {
            const clubName = clubData.clubName || '';
            const clubType = clubData.clubType || '';
            const goals = clubData.goals || '';
            const requirements = clubData.requirements || '';
            const description = clubData.clubDescription || '';
            const members = clubData.members || [];
            try {
                const res = await fetch('/api/generate-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName, clubType, goals, requirements, description, members })
                });
                const result = await res.json();
                if (result.success) {
                    alert('Tasks generated! Check your clubTask node in the database.');
                    // Optionally display tasks in the UI
                    // console.log(result.tasks);
                } else {
                    alert(result.message || 'Failed to generate tasks.');
                }
            } catch (err) {
                alert('Error generating tasks.');
            }
        };
        // Add the new listener
        generateBtn.addEventListener('click', generateTasksHandler);
    }

    const taskListEl = document.querySelector('.task-list');
    if (taskListEl) {
        taskListEl.innerHTML = '';
        const tasksObj = clubData.clubTask;
        if (tasksObj && typeof tasksObj === 'object' && Object.keys(tasksObj).length > 0) {
            Object.values(tasksObj).forEach(task => {
                const taskItemHTML = createTaskItem(task);
                taskListEl.insertAdjacentHTML('beforeend', taskItemHTML);
            });
        } else {
            taskListEl.innerHTML = '<div class="text-sm text-base-content/70">No tasks found.</div>';
        }
    }
}
