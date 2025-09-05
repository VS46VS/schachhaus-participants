class ParticipantsList {
    constructor(containerId, apiEndpoint) {
        this.container = document.getElementById(containerId);
        this.apiEndpoint = apiEndpoint || 'http://128.140.110.152/api/participants/approved';
        this.participants = [];
        this.init();
    }

    async init() {
        await this.loadParticipants();
        this.render();
        this.startAutoRefresh();
    }

    async loadParticipants() {
        try {
            const response = await fetch(this.apiEndpoint, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (response.ok) {
                this.participants = await response.json();
                console.log(`Loaded ${this.participants.length} participants`);
            } else {
                console.error('Failed to load participants:', response.status);
                this.participants = [];
            }
        } catch (error) {
            console.error('Error loading participants:', error);
            this.participants = [];
        }
    }

    render() {
        if (!this.container) return;

        const sortedParticipants = this.sortByElo([...this.participants]);

        const html = `
            <div class="participants-header">
                <div class="participant-count">${this.participants.length} Anmeldungen</div>
            </div>
            <div class="participants-table-container">
                <table class="participants-table">
                    <thead>
                        <tr>
                            <th>Platz</th>
                            <th>Name</th>
                            <th>Verein</th>
                            <th>Jahrgang</th>
                            <th>ELO</th>
                            <th>Anmeldung</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedParticipants.map((participant, index) => this.renderParticipantRow(participant, index + 1)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderParticipantRow(participant, position) {
        const registrationDate = new Date(participant.registrationDate).toLocaleDateString('de-DE');
        const eloDisplay = participant.eloDwz ? participant.eloDwz : '-';
        
        return `
            <tr>
                <td class="position">${position}</td>
                <td class="name">${this.escapeHtml(participant.name)}</td>
                <td class="club">${this.escapeHtml(participant.club)}</td>
                <td class="birth-year">${participant.birthYear}</td>
                <td class="elo-rating">${eloDisplay}</td>
                <td class="registration-date">${registrationDate}</td>
            </tr>
        `;
    }

    sortByElo(participants) {
        return participants.sort((a, b) => {
            const eloA = parseInt(a.eloDwz) || 0;
            const eloB = parseInt(b.eloDwz) || 0;
            return eloB - eloA;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async refresh() {
        await this.loadParticipants();
        this.render();
    }

    startAutoRefresh(intervalMs = 30000) {
        setInterval(() => {
            this.refresh();
        }, intervalMs);
    }

    filterByClub(clubName) {
        const filtered = clubName 
            ? this.participants.filter(p => p.club.toLowerCase().includes(clubName.toLowerCase()))
            : this.participants;
        
        this.renderFiltered(filtered);
    }

    renderFiltered(filteredParticipants) {
        if (!this.container) return;

        const sortedParticipants = this.sortByElo([...filteredParticipants]);
        const tbody = this.container.querySelector('.participants-table tbody');
        if (tbody) {
            tbody.innerHTML = sortedParticipants.map((participant, index) => this.renderParticipantRow(participant, index + 1)).join('');
        }
    }

    addSearchFilter() {
        const searchHtml = `
            <div class="participants-search">
                <input type="text" id="clubFilter" placeholder="Nach Verein suchen...">
            </div>
        `;
        
        this.container.insertAdjacentHTML('afterbegin', searchHtml);
        
        const searchInput = document.getElementById('clubFilter');
        searchInput.addEventListener('input', (e) => {
            this.filterByClub(e.target.value);
        });
    }
}

const participantsListCSS = `
    body:has(.participants-table) .container {
        max-width: 1000px;
    }
    
    .participants-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 15px;
        padding: 0;
    }


    .participant-count {
        background: rgb(94, 41, 37);
        color: white;
        padding: 12px 20px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 1rem;
        box-shadow: 0 4px 15px rgba(94, 41, 37, 0.3);
    }

    .participants-search {
        margin-bottom: 25px;
        padding: 0;
    }

    .participants-search input {
        width: 100%;
        max-width: 400px;
        padding: 12px 16px;
        border: 2px solid rgba(94, 41, 37, 0.2);
        border-radius: 10px;
        font-size: 16px;
        font-family: "Source Sans 3", sans-serif;
        background: rgba(255, 255, 255, 0.8);
        color: rgb(94, 41, 37);
        transition: all 0.3s ease;
    }

    .participants-search input:focus {
        outline: none;
        border-color: rgb(94, 41, 37);
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 0 4px rgba(94, 41, 37, 0.15);
    }

    .participants-table-container {
        overflow-x: auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 8px 25px rgba(94, 41, 37, 0.15);
        margin: 0;
        border: 2px solid rgba(94, 41, 37, 0.1);
    }

    .participants-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 950px;
        font-family: "Source Sans 3", sans-serif;
    }

    .participants-table th {
        background: rgb(94, 41, 37);
        color: white;
        padding: 20px 16px;
        text-align: left;
        font-weight: 700;
        font-size: 1.1rem;
        border-bottom: 3px solid rgb(74, 31, 27);
    }

    .participants-table th:nth-child(1),
    .participants-table th:nth-child(4),
    .participants-table th:nth-child(5) {
        text-align: center;
    }

    .participants-table th:first-child {
        border-top-left-radius: 18px;
    }

    .participants-table th:last-child {
        border-top-right-radius: 18px;
    }

    .participants-table td {
        padding: 16px;
        border-bottom: 1px solid rgba(94, 41, 37, 0.1);
        font-size: 1rem;
    }

    .participants-table tbody tr:nth-child(even) {
        background-color: rgba(208, 176, 144, 0.1);
    }

    .participants-table tbody tr:hover {
        background-color: rgba(208, 176, 144, 0.3);
        transition: background-color 0.2s ease;
    }

    .participants-table tr:last-child td {
        border-bottom: none;
    }

    .participants-table tr:last-child td:first-child {
        border-bottom-left-radius: 18px;
    }

    .participants-table tr:last-child td:last-child {
        border-bottom-right-radius: 18px;
    }

    .position {
        font-weight: bold;
        color: rgb(94, 41, 37);
        text-align: center;
        width: 80px;
        font-size: 1.1rem;
    }

    .name {
        font-weight: 600;
        color: rgb(94, 41, 37);
        min-width: 200px;
    }

    .club {
        color: rgb(74, 31, 27);
        font-weight: 500;
        min-width: 180px;
    }

    .birth-year {
        text-align: center;
        width: 100px;
        color: rgb(94, 41, 37);
        font-weight: 500;
    }

    .elo-rating {
        font-weight: bold;
        color: rgb(94, 41, 37);
        text-align: center;
        width: 120px;
        font-size: 1.05rem;
    }

    .registration-date {
        color: rgb(74, 31, 27);
        font-size: 14px;
        white-space: nowrap;
        min-width: 120px;
        font-weight: 500;
    }

    @media (max-width: 1200px) {
        .participants-table-container {
            margin: 0 10px;
        }

        .participants-header,
        .participants-search {
            padding: 0 10px;
        }
    }

    @media (max-width: 768px) {
        .participants-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }


        .participants-table th,
        .participants-table td {
            padding: 12px 8px;
            font-size: 14px;
        }

        .participants-table {
            min-width: 600px;
        }

        .participants-table-container {
            margin: 0 5px;
        }

        .participants-header,
        .participants-search {
            padding: 0 5px;
        }
    }

    @media (max-width: 480px) {
        .participants-table th,
        .participants-table td {
            padding: 8px 4px;
            font-size: 12px;
        }

        .registration-date {
            display: none;
        }

        .participants-table th:last-child,
        .participants-table td:last-child {
            display: none;
        }

    }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = participantsListCSS;
    document.head.appendChild(style);
}

window.ParticipantsList = ParticipantsList;