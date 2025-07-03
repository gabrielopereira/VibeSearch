// Histogram rendering function
function renderHistogram(histogramData) {
    if (!histogramData) return;
    
    const ctx = document.getElementById('year-histogram').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.yearChart) {
        window.yearChart.destroy();
    }
    
    window.yearChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: histogramData.years,
            datasets: [{
                label: 'Publications',
                data: histogramData.counts,
                backgroundColor: '#ba76b2',
                borderColor: '#8a437f',
                borderWidth: 1,
                hoverBackgroundColor: '#8a437f'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 4,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return 'Year: ' + context[0].label;
                        },
                        label: function(context) {
                            return 'Publications: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(val, index) {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            const year = parseInt(this.getLabelForValue(val));
                            // Show years that are multiples of 5 (2000, 2005, 2010, etc.)
                            return year % 5 === 0 ? year : '';
                        }
                    },
                    grid: {
                        display: true,
                        drawTicks: true,
                        color: '#f0f0f0'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Publications'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: function(context) {
                            const maxValue = Math.max(...context.chart.data.datasets[0].data);
                            if (maxValue <= 5) return 1;
                            if (maxValue <= 10) return 2;
                            if (maxValue <= 20) return 5;
                            return Math.ceil(maxValue / 5);
                        }
                    },
                    grid: {
                        display: true,
                        color: '#f0f0f0'
                    }
                }
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const year = histogramData.years[index];
                    handleYearSelection(year, index);
                }
            }
        }
    });
    
    // Store original colors for resetting
    window.originalBarColors = Array(histogramData.years.length).fill('#ba76b2');
    window.currentlySelectedYear = null;
}

// Handle year selection (select or deselect)
function handleYearSelection(selectedYear, pointIndex) {
    console.log('Year clicked:', selectedYear, 'Index:', pointIndex);
    
    // If clicking the same year, deselect it
    if (window.currentlySelectedYear === selectedYear) {
        console.log('Deselecting year:', selectedYear);
        showAllResults();
        return;
    }
    
    // Otherwise, select the new year
    console.log('Selecting year:', selectedYear);
    window.currentlySelectedYear = selectedYear;
    filterResultsByYear(selectedYear, pointIndex);
}

// Filter results by year
function filterResultsByYear(selectedYear, pointIndex) {
    const resultCards = document.querySelectorAll('.result-card');
    let visibleCount = 0;
    let totalCards = resultCards.length;
    
    console.log('Filtering for year:', selectedYear, 'Total cards:', totalCards);
    
    resultCards.forEach((card, index) => {
        // Look for year in the result meta section
        const yearMatch = card.textContent.match(/Year:\s*(\d+)/);
        
        if (yearMatch) {
            const cardYear = parseInt(yearMatch[1]);
            console.log(`Card ${index}: Year ${cardYear}, matches ${selectedYear}: ${cardYear === selectedYear}`);
            
            if (cardYear === selectedYear) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        } else {
            console.log(`Card ${index}: No year found`);
            card.style.display = 'none';
        }
    });
    
    console.log('Visible cards:', visibleCount);
    
    // Highlight the selected bar
    highlightSelectedBar(pointIndex);
    
    // Show/hide "Show All" button
    showShowAllButton(selectedYear, visibleCount);
}

// Highlight the selected bar
function highlightSelectedBar(selectedIndex) {
    if (window.yearChart) {
        const colors = [...window.originalBarColors];
        colors[selectedIndex] = '#6a1b9a'; // Darker purple for selected bar
        
        window.yearChart.data.datasets[0].backgroundColor = colors;
        window.yearChart.update();
    }
}

// Show "Show All" button when filtered
function showShowAllButton(selectedYear, visibleCount) {
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
    
    showAllButton.textContent = `Showing ${visibleCount} results from ${selectedYear}. Click to reset.`;
    showAllButton.style.display = 'inline-block';
}

// Show all results
function showAllResults() {
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Reset bar colors to original
    resetBarColors();
    
    // Reset selected year
    window.currentlySelectedYear = null;
    
    // Hide the "Show All" button
    const showAllButton = document.getElementById('show-all-button');
    if (showAllButton) {
        showAllButton.style.display = 'none';
    }
}

// Reset bar colors to original
function resetBarColors() {
    if (window.yearChart && window.originalBarColors) {
        window.yearChart.data.datasets[0].backgroundColor = window.originalBarColors;
        window.yearChart.update();
    }
} 