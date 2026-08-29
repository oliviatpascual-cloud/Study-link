const demoStart = document.querySelector('#demo-start');
const demoToast = document.querySelector('#demo-toast');
const featuredMatch = document.querySelector('.featured-row');
const appModal = document.querySelector('#app-modal');
const messageInput = document.querySelector('#message-input');
const messageThread = document.querySelector('#message-thread');
const profileGrid = document.querySelector('.profile-grid');
const profileActions = document.querySelector('.profile-actions');
const roomView = document.querySelector('#room-view');
const roomTimer = document.querySelector('.room-timer');
const profileSwitcher = document.querySelector('#profile-switcher');
const profileMenu = document.querySelector('#profile-menu');
const sidebarAvatar = document.querySelector('#sidebar-avatar');
const sidebarName = document.querySelector('#sidebar-name');
const sidebarRole = document.querySelector('#sidebar-role');
const topAvatar = document.querySelector('#top-avatar');
const topName = document.querySelector('#top-name');
const greetingName = document.querySelector('#greeting-name');
const greetingSubtitle = document.querySelector('#greeting-subtitle');
const guideOpen = document.querySelector('#guide-open');
const guideDrawer = document.querySelector('#guide-drawer');
const journeyProgress = document.querySelector('#journey-progress');
const workshopOpen = document.querySelector('#workshop-open');
const workshopStart = document.querySelector('#workshop-start');
const workshopDrawer = document.querySelector('#workshop-drawer');
const workshopTime = document.querySelector('#workshop-time');
const workshopPause = document.querySelector('#workshop-pause');
const workshopPrompt = document.querySelector('#workshop-prompt-text');
let toastTimer;
let sessionTimer;
let sessionSeconds = 0;
let workshopTimer;
let workshopSeconds = 3600;
let workshopPaused = true;
let promptIndex = 0;
const workshopPrompts = [
	'What would make a student feel comfortable asking for help?',
	'Which matching signal should matter most for a first session?',
	'How can a skill check feel useful instead of like a test?',
	'What should never be shared in a tutoring conversation?',
	'Where could a tutor use the whiteboard to make the idea clearer?',
	'What evidence would show that tutoring actually helped?',
	'How does switching to tutor mode change the design?',
	'What would you improve before this prototype became a real product?'
];
let backendConnected = false;
const demoProfiles = {
	jordan: { initial: 'J', name: 'Jordan Lee', shortName: 'Jordan', role: 'Grade 8 student', avatarClass: 'avatar-student', subtitle: 'Ready to make a little progress?' },
	maya: { initial: 'M', name: 'Maya R.', shortName: 'Maya', role: 'Grade 8 tutor', avatarClass: 'avatar-maya', subtitle: 'Ready to help someone get unstuck?' },
	sam: { initial: 'S', name: 'Sam P.', shortName: 'Sam', role: 'Grade 7 tutor', avatarClass: 'avatar-jordan', subtitle: 'Ready to make a little progress?' }
};

function showDemoToast(message) {
	demoToast.textContent = message;
	demoToast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => demoToast.classList.remove('is-visible'), 4200);
}

function toggleProfileMenu() {
	profileMenu.hidden = !profileMenu.hidden;
	profileSwitcher.setAttribute('aria-expanded', String(!profileMenu.hidden));
}

function switchProfile(profileId) {
	const profile = demoProfiles[profileId];
	sidebarAvatar.textContent = profile.initial;
	sidebarAvatar.className = `avatar ${profile.avatarClass}`;
	sidebarName.textContent = profile.name;
	sidebarRole.textContent = profile.role;
	topAvatar.textContent = profile.initial;
	topAvatar.className = `mini-user-avatar ${profile.avatarClass}`;
	topName.textContent = profile.shortName;
	greetingName.textContent = profile.shortName;
	greetingSubtitle.textContent = profile.subtitle;
	document.querySelectorAll('.profile-option').forEach((option) => option.classList.toggle('is-selected', option.dataset.profile === profileId));
	profileMenu.hidden = true;
	profileSwitcher.setAttribute('aria-expanded', 'false');
	showDemoToast(`${profile.name} demo profile is now active.`);
}

function openProfile() {
	closeGuide();
	closeWorkshop();
	appModal.classList.add('is-open');
	appModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-open');
	profileGrid.hidden = false;
	profileActions.hidden = false;
	roomView.classList.remove('is-active');
	roomView.setAttribute('aria-hidden', 'true');
	messageInput.focus();
}

function closeProfile() {
	appModal.classList.remove('is-open');
	appModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-open');
}

function openGuide() {
	guideDrawer.classList.add('is-open');
	guideDrawer.setAttribute('aria-hidden', 'false');
}

function closeGuide() {
	guideDrawer.classList.remove('is-open');
	guideDrawer.setAttribute('aria-hidden', 'true');
}

function openWorkshop() {
	workshopDrawer.classList.add('is-open');
	workshopDrawer.setAttribute('aria-hidden', 'false');
}

function closeWorkshop() {
	workshopDrawer.classList.remove('is-open');
	workshopDrawer.setAttribute('aria-hidden', 'true');
}

function updateWorkshopClock() {
	const minutes = String(Math.floor(workshopSeconds / 60)).padStart(2, '0');
	const seconds = String(workshopSeconds % 60).padStart(2, '0');
	workshopTime.textContent = `${minutes}:${seconds}`;
}

function startWorkshop() {
	openWorkshop();
	if (!workshopPaused) return;
	workshopPaused = false;
	workshopPause.textContent = 'Pause';
	clearInterval(workshopTimer);
	workshopTimer = window.setInterval(() => {
		if (workshopSeconds <= 0) {
			clearInterval(workshopTimer);
			workshopPaused = true;
			workshopPause.textContent = 'Restart';
			return;
		}
		workshopSeconds -= 1;
		updateWorkshopClock();
	}, 1000);
}

function updateJourney(step) {
	journeyProgress.textContent = `${step} of 7`;
	document.querySelectorAll('[data-journey]').forEach((item) => item.classList.toggle('is-current', item.dataset.journey === String(step)));
}

function addMessage(message, sender) {
	const messageElement = document.createElement('div');
	messageElement.className = `message message-${sender}`;
	messageElement.textContent = message;
	messageThread.appendChild(messageElement);
	messageThread.scrollTop = messageThread.scrollHeight;
}

async function sendMessage() {
	const message = messageInput.value.trim();
	if (!message) return;
	addMessage(message, 'student');
	messageInput.value = '';
	if (backendConnected) {
		const result = await window.studyLinkBackend.sendMessage({ tutorId: '00000000-0000-0000-0000-000000000002', senderId: '00000000-0000-0000-0000-000000000001', body: message });
		if (result.error) {
			showDemoToast('Message is visible locally, but Supabase rejected the save. Check your table policies.');
			return;
		}
	}
	window.setTimeout(() => addMessage('Got it. Let us take it one step at a time.', 'tutor'), 550);
	showDemoToast(backendConnected ? 'Message saved to the Supabase demo room.' : 'Message sent in local demo mode.');
}

window.studyLinkBackend.connect().then((connected) => {
	backendConnected = connected;
});

demoStart.addEventListener('click', () => {
	showDemoToast('Demo student profile loaded: Grade 8 Math, linear equations, explanation.');
	featuredMatch.classList.remove('demo-active');
	window.setTimeout(() => featuredMatch.classList.add('demo-active'), 350);
	showScreen('dashboard');
});

document.querySelectorAll('.tutor-row .button').forEach((profileButton) => {
	profileButton.addEventListener('click', (event) => {
		event.preventDefault();
		openProfile();
	});
});
document.querySelectorAll('[data-open-profile]').forEach((profileButton) => {
	profileButton.addEventListener('click', (event) => {
		event.preventDefault();
		openProfile();
	});
});

function showScreen(screenName) {
	document.querySelectorAll('[data-screen-view]').forEach((screen) => screen.classList.toggle('is-visible', screen.dataset.screenView === screenName));
	document.querySelectorAll('.workspace-nav-item').forEach((item) => item.classList.toggle('is-current', item.dataset.screen === screenName));
	document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
	const journeyStep = { dashboard: 1, find: 2, skill: 3, progress: 7 }[screenName];
	if (journeyStep) updateJourney(journeyStep);
}

document.querySelectorAll('.workspace-nav-item, [data-screen-target], [data-screen-link]').forEach((screenButton) => screenButton.addEventListener('click', (event) => {
	event.preventDefault();
	showScreen(screenButton.dataset.screen || screenButton.dataset.screenTarget || screenButton.dataset.screenLink);
}));
guideOpen.addEventListener('click', openGuide);
document.querySelectorAll('[data-close-guide]').forEach((closeButton) => closeButton.addEventListener('click', closeGuide));
workshopOpen.addEventListener('click', openWorkshop);
workshopStart.addEventListener('click', startWorkshop);
document.querySelectorAll('[data-close-workshop]').forEach((closeButton) => closeButton.addEventListener('click', closeWorkshop));
workshopPause.addEventListener('click', () => {
	if (workshopPaused) {
		if (workshopSeconds <= 0) workshopSeconds = 3600;
		startWorkshop();
	} else {
		workshopPaused = true;
		clearInterval(workshopTimer);
		workshopPause.textContent = 'Resume';
	}
});
document.querySelector('#next-prompt').addEventListener('click', () => {
	promptIndex = (promptIndex + 1) % workshopPrompts.length;
	workshopPrompt.textContent = workshopPrompts[promptIndex];
});
document.querySelectorAll('[data-journey]').forEach((journeyItem) => journeyItem.addEventListener('click', () => updateJourney(journeyItem.dataset.journey)));
document.querySelectorAll('[data-start-room]').forEach((roomButton) => roomButton.addEventListener('click', () => {
	updateJourney(3);
	openProfile();
	window.setTimeout(() => document.querySelector('#start-session').click(), 250);
}));
profileSwitcher.addEventListener('click', toggleProfileMenu);
document.querySelectorAll('.profile-option').forEach((profileOption) => profileOption.addEventListener('click', () => switchProfile(profileOption.dataset.profile)));
document.addEventListener('click', (event) => {
	if (!profileMenu.hidden && !profileMenu.contains(event.target) && !profileSwitcher.contains(event.target)) {
		profileMenu.hidden = true;
		profileSwitcher.setAttribute('aria-expanded', 'false');
	}
});
document.querySelectorAll('.choice').forEach((choice) => choice.addEventListener('click', () => {
	document.querySelectorAll('.choice').forEach((button) => button.classList.remove('is-selected'));
	choice.classList.add('is-selected');
	showDemoToast(`${choice.textContent} help selected for your demo match.`);
}));
document.querySelectorAll('.filter-row select').forEach((select) => select.addEventListener('change', () => {
	showDemoToast(`${select.value} added to your fictional tutor search.`);
}));
document.querySelectorAll('.request-row .button').forEach((requestButton) => requestButton.addEventListener('click', () => {
	requestButton.textContent = requestButton.textContent.trim() === 'Accept' ? 'Accepted' : 'Reviewed';
	requestButton.classList.add('request-complete');
	showDemoToast('Tutor dashboard updated with this demo request.');
}));
document.querySelectorAll('[data-quiz-option]').forEach((option) => option.addEventListener('click', () => {
	document.querySelectorAll('[data-quiz-option]').forEach((button) => button.classList.remove('is-correct'));
	option.classList.add('is-correct');
	document.querySelector('#quiz-result').classList.add('is-visible');
	showDemoToast('Skill check complete. Linear equations recommended.');
}));

document.querySelectorAll('[data-close-modal]').forEach((closeButton) => closeButton.addEventListener('click', closeProfile));
document.querySelectorAll('.preset-message').forEach((presetButton) => presetButton.addEventListener('click', () => {
	messageInput.value = presetButton.dataset.message;
	messageInput.focus();
}));
document.querySelector('#send-message').addEventListener('click', sendMessage);
document.querySelector('#start-session').addEventListener('click', () => {
	profileGrid.hidden = true;
	profileActions.hidden = true;
	roomView.classList.add('is-active');
	roomView.setAttribute('aria-hidden', 'false');
	sessionSeconds = 0;
	clearInterval(sessionTimer);
	sessionTimer = window.setInterval(() => {
		sessionSeconds += 1;
		const minutes = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
		const seconds = String(sessionSeconds % 60).padStart(2, '0');
		roomTimer.innerHTML = `<i></i> ${minutes}:${seconds}`;
	}, 1000);
	showDemoToast('Safe Algebra room started with Maya.');
});
document.querySelector('#end-session').addEventListener('click', () => {
	clearInterval(sessionTimer);
	closeProfile();
	showDemoToast('Session ended. Demo progress improved from 62% to 78%.');
});
document.querySelector('#report-user').addEventListener('click', () => {
	showDemoToast('Safety report opened. This prototype keeps the report fictional and private.');
});
document.querySelectorAll('.room-control:not(#end-session)').forEach((control) => control.addEventListener('click', () => {
	control.classList.toggle('is-off');
	const state = control.classList.contains('is-off') ? 'off' : 'on';
	showDemoToast(`${control.textContent.trim()} is ${state} in this demo room.`);
}));
document.querySelectorAll('.board-tools button').forEach((tool) => tool.addEventListener('click', () => {
	document.querySelectorAll('.board-tools button').forEach((button) => button.classList.remove('tool-active'));
	tool.classList.add('tool-active');
	showDemoToast(`${tool.textContent} tool selected for the shared whiteboard.`);
}));
messageInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') sendMessage();
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && appModal.classList.contains('is-open')) closeProfile();
	if (event.key === 'Escape' && guideDrawer.classList.contains('is-open')) closeGuide();
	if (event.key === 'Escape' && workshopDrawer.classList.contains('is-open')) closeWorkshop();
});
