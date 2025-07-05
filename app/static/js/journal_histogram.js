// Journal histogram rendering function
function renderJournalHistogram(journalData) {
    if (!journalData) return;
    
    const ctx = document.getElementById('journal-histogram').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.journalChart) {
        window.journalChart.destroy();
    }
    
    window.journalChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: journalData.journals,
            datasets: [{
                label: 'Publications',
                data: journalData.counts,
                backgroundColor: [
                    '#ba76b2', '#8a437f', '#6a1b9a', '#9c27b0', '#673ab7',
                    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBackgroundColor: '#6a1b9a',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            cutout: '50%',
            circumference: 180, // Makes it a half-circle (180 degrees)
            rotation: -90, // Starts from the top (rotates -90 degrees)
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                            size: 10
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[i];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    // Truncate journal name to 5 words
                                    const words = label.split(' ');
                                    const truncatedLabel = words.length > 5 
                                        ? words.slice(0, 5).join(' ') + '...' 
                                        : label;
                                    
                                    return {
                                        text: `${truncatedLabel} (${percentage}%)`,
                                        fillStyle: dataset.backgroundColor[i],
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: dataset.borderWidth,
                                        pointStyle: 'circle',
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return 'Journal: ' + context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Publications: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const journal = journalData.journals[index];
                    handleJournalSelection(journal, index);
                }
            }
        }
    });
    
    // Store original colors for resetting
    const defaultColors = [
        '#ba76b2', '#8a437f', '#6a1b9a', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688'
    ];
    window.originalJournalColors = journalData.journals.map((_, index) => 
        defaultColors[index % defaultColors.length]
    );
    window.currentlySelectedJournal = null;
}

// Handle journal selection (select or deselect)
function handleJournalSelection(selectedJournal, pointIndex) {
    console.log('Journal clicked:', selectedJournal, 'Index:', pointIndex);
    
    // If clicking the same journal, deselect it
    if (window.currentlySelectedJournal === selectedJournal) {
        console.log('Deselecting journal:', selectedJournal);
        showAllResults();
        return;
    }
    
    // Otherwise, select the new journal
    console.log('Selecting journal:', selectedJournal);
    window.currentlySelectedJournal = selectedJournal;
    filterResultsByJournal(selectedJournal, pointIndex);
}

// Filter results by journal
function filterResultsByJournal(selectedJournal, pointIndex) {
    const resultCards = document.querySelectorAll('.result-card');
    let visibleCount = 0;
    let totalCards = resultCards.length;
    
    console.log('Filtering for journal:', selectedJournal, 'Total cards:', totalCards);
    
    resultCards.forEach((card, index) => {
        // Look for journal in the result meta section - find the div containing "Journal:"
        const journalDiv = Array.from(card.querySelectorAll('div')).find(div => 
            div.textContent.includes('Journal:')
        );
        
        if (journalDiv) {
            // Extract the journal name after "Journal:"
            const journalText = journalDiv.textContent;
            const journalMatch = journalText.match(/Journal:\s*(.+)/);
            
            if (journalMatch) {
                const cardJournal = journalMatch[1].trim();
                console.log(`Card ${index}: Journal "${cardJournal}", matches "${selectedJournal}": ${cardJournal === selectedJournal}`);
                
                if (cardJournal === selectedJournal) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            } else {
                console.log(`Card ${index}: Journal text found but no match`);
                card.style.display = 'none';
            }
        } else {
            console.log(`Card ${index}: No journal div found`);
            card.style.display = 'none';
        }
    });
    
    console.log('Visible cards:', visibleCount);
    
    // Highlight the selected bar
    highlightSelectedJournal(pointIndex);
    
    // Show/hide "Show All" button
    showShowAllButton(selectedJournal, visibleCount);
}

// Highlight the selected journal segment
function highlightSelectedJournal(selectedIndex) {
    if (window.journalChart) {
        const colors = [...window.originalJournalColors];
        colors[selectedIndex] = '#6a1b9a'; // Darker purple for selected segment
        
        window.journalChart.data.datasets[0].backgroundColor = colors;
        window.journalChart.update();
    }
}

// Show "Show All" button when filtered (reuse existing function)
function showShowAllButton(selectedItem, visibleCount) {
    let showAllButton = document.getElementById('show-all-button');
    
    if (!showAllButton) {
        showAllButton = document.createElement('button');
        showAllButton.id = 'show-all-button';
        showAllButton.className = 'show-all-button';
        showAllButton.onclick = showAllResults;
        
        // Insert after the results header
        const resultsHeader = document.querySelector('.results-header');
        if (resultsHeader) {
            resultsHeader.appendChild(showAllButton);
        }
    }
    
    showAllButton.textContent = `Showing ${visibleCount} results from ${selectedItem}. Click to reset.`;
    showAllButton.style.display = 'inline-block';
}

// Show all results (reuse existing function)
function showAllResults() {
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Reset bar colors to original
    resetJournalBarColors();
    
    // Reset selected journal
    window.currentlySelectedJournal = null;
    
    // Hide the "Show All" button
    const showAllButton = document.getElementById('show-all-button');
    if (showAllButton) {
        showAllButton.style.display = 'none';
    }
}

// Reset journal bar colors to original
function resetJournalBarColors() {
    if (window.journalChart && window.originalJournalColors) {
        window.journalChart.data.datasets[0].backgroundColor = window.originalJournalColors;
        window.journalChart.update();
    }
} 