

document.addEventListener('DOMContentLoaded', () => {
    const token = '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'; // Replace with your GitHub token
  
    const daysOfWeek = document.getElementById('days-of-week');
    const calendarGrid = document.getElementById('calendar-grid');
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let currentDate = new Date();
  
    function fetchGitHubContributions() {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
  
        const query = `
        {
            viewer {
                contributionsCollection {
                    contributionCalendar {
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }`;
  
        return fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        }).then(response => response.json());
    }
  
    function renderCalendar(contributions) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  
        // Clear previous content
        daysOfWeek.innerHTML = '';
        calendarGrid.innerHTML = '';
  
        // Render days of the week
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-of-week';
            dayElement.textContent = day;
            daysOfWeek.appendChild(dayElement);
        });
  
        // Add empty cells for the days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-cell';
            calendarGrid.appendChild(emptyCell);
        }
  
        // Add cells for each day of the month with contribution levels
        const contributionsMap = new Map(contributions.map(c => [new Date(c.date).getDate(), c.contributionCount]));
        for (let day = 1; day <= lastDateOfMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'date-cell';
            dateCell.textContent = day;
  
            // Set contribution level based on fetched data
            const contributionCount = contributionsMap.get(day) || 0;
            const level = getContributionLevel(contributionCount);
            dateCell.classList.add(level);
  
            calendarGrid.appendChild(dateCell);
        }
    }
  
    function getContributionLevel(count) {
      if (count >= 12) return 'very-high';  // For the darkest green
      if (count >= 8) return 'high';        // For the dark green
      if (count >= 1) return 'medium';      // For the light green
      return 'low';                         // For the lightest gray
  }
  
  
    function updateCalendar() {
        fetchGitHubContributions().then(data => {
            if (data.data) {
                const contributions = data.data.viewer.contributionsCollection.contributionCalendar.weeks.flatMap(week => week.contributionDays);
                const filteredContributions = contributions.filter(c => {
                    const contributionDate = new Date(c.date);
                    return contributionDate.getFullYear() === currentDate.getFullYear() &&
                           contributionDate.getMonth() === currentDate.getMonth();
                });
                renderCalendar(filteredContributions);
            } else {
                console.error('No contribution data found');
            }
        }).catch(error => console.error('Error fetching data:', error));
    }
  
    // Initial render
    updateCalendar();
  });
  