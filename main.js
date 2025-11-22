// Markdown to PDF Converter - Main JavaScript
class MarkdownPDFConverter {
    constructor() {
        this.currentTheme = 'minimal';
        this.currentContent = '';
        this.debounceTimer = null;
        this.themes = {
            minimal: {
                name: 'Minimal',
                styles: {
                    background: '#FFFFFF',
                    text: '#2C2C2C',
                    heading: '#2C2C2C',
                    accent: '#C4856A',
                    secondary: '#6B6B6B',
                    font: 'Inter, sans-serif'
                }
            },
            academic: {
                name: 'Academic',
                styles: {
                    background: '#FFFEF7',
                    text: '#2C2C2C',
                    heading: '#1A1A1A',
                    accent: '#8B4513',
                    secondary: '#6B6B6B',
                    font: 'Times New Roman, serif'
                }
            },
            business: {
                name: 'Business',
                styles: {
                    background: '#FFFFFF',
                    text: '#1F2937',
                    heading: '#111827',
                    accent: '#2563EB',
                    secondary: '#6B7280',
                    font: 'Inter, sans-serif'
                }
            },
            creative: {
                name: 'Creative',
                styles: {
                    background: '#FAF5FF',
                    text: '#3730A3',
                    heading: '#312E81',
                    accent: '#7C3AED',
                    secondary: '#6B7280',
                    font: 'Georgia, serif'
                }
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupFileUpload();
        this.loadSampleContent();
        this.initializeStatsChart();
    }

    setupEventListeners() {
        const editor = document.getElementById('markdownEditor');
        const themeCards = document.querySelectorAll('.theme-card');
        const fileInput = document.getElementById('fileInput');

        // Editor input with debouncing
        editor.addEventListener('input', (e) => {
            this.currentContent = e.target.value;
            this.updateWordCount();
            this.debouncePreview();
        });

        // Theme selection
        themeCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectTheme(card.dataset.theme);
            });
        });

        // File upload
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.downloadMarkdown();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.generatePDF();
                        break;
                }
            }
        });
    }

    initializeAnimations() {
        // Initialize Splitting.js for text animations
        Splitting();

        // Animate hero text
        setTimeout(() => {
            const chars = document.querySelectorAll('[data-splitting] .char');
            chars.forEach((char, index) => {
                setTimeout(() => {
                    char.classList.add('visible');
                }, index * 50);
            });
        }, 500);

        // Scroll animations
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('fileUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileUpload(file) {
        if (!file || !file.name.match(/\.(md|markdown)$/i)) {
            this.showNotification('Please upload a valid markdown file (.md or .markdown)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result;

            // Remove UTF-8 BOM if present (common in Typora files)
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }

            // Normalize line endings (Typora may use different line endings)
            content = content.replace(/\r\n/g, '\n');

            document.getElementById('markdownEditor').value = content;
            this.currentContent = content;
            this.updatePreview();
            this.updateWordCount();
            this.showNotification(`Loaded ${file.name} successfully! 📄`, 'success');
        };

        reader.onerror = (e) => {
            console.error('Error reading file:', e);
            this.showNotification('Error reading file. Please try again.', 'error');
        };

        // Explicitly specify UTF-8 encoding
        reader.readAsText(file, 'UTF-8');
    }

    debouncePreview() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updatePreview();
        }, 300);
    }

    updatePreview() {
        const preview = document.getElementById('previewContent');
        const theme = this.themes[this.currentTheme];
        
        if (!this.currentContent.trim()) {
            preview.innerHTML = `
                <div class="text-center text-gray-500 py-12">
                    <svg class="mx-auto w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p>Your preview will appear here as you type...</p>
                </div>
            `;
            return;
        }

        try {
            const html = marked.parse(this.currentContent);
            const styledHtml = this.applyThemeStyles(html, theme);
            preview.innerHTML = styledHtml;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            preview.innerHTML = `
                <div class="text-red-500 p-4 bg-red-50 rounded-lg">
                    <p class="font-semibold">Error parsing markdown:</p>
                    <p class="text-sm mt-1">${error.message}</p>
                </div>
            `;
        }
    }

    applyThemeStyles(html, theme) {
        const styleBlock = `
            <style>
                .theme-content {
                    font-family: ${theme.styles.font};
                    color: ${theme.styles.text};
                    background: ${theme.styles.background};
                    line-height: 1.7;
                    padding: 2rem;
                }
                .theme-content h1, .theme-content h2, .theme-content h3,
                .theme-content h4, .theme-content h5, .theme-content h6 {
                    color: ${theme.styles.heading};
                    font-weight: 600;
                    margin: 1.5rem 0 0.75rem 0;
                }
                .theme-content h1 { font-size: 2.25rem; }
                .theme-content h2 { font-size: 1.875rem; }
                .theme-content h3 { font-size: 1.5rem; }
                .theme-content p { margin: 0.75rem 0; }
                .theme-content code {
                    background: ${theme.styles.secondary}20;
                    color: ${theme.styles.accent};
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                }
                .theme-content pre {
                    background: ${theme.styles.secondary}20;
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1rem 0;
                }
                .theme-content blockquote {
                    border-left: 4px solid ${theme.styles.accent};
                    padding-left: 1rem;
                    margin: 1rem 0;
                    font-style: italic;
                    color: ${theme.styles.secondary};
                }
                .theme-content a {
                    color: ${theme.styles.accent};
                    text-decoration: none;
                }
                .theme-content a:hover {
                    text-decoration: underline;
                }
            </style>
        `;
        
        return styleBlock + `<div class="theme-content">${html}</div>`;
    }

    selectTheme(themeName) {
        this.currentTheme = themeName;
        
        // Update active theme card
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Update preview
        this.updatePreview();
        
        // Animate theme change
        anime({
            targets: '#previewContent',
            scale: [0.98, 1],
            opacity: [0.8, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }

    updateWordCount() {
        const words = this.currentContent.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const charCount = this.currentContent.length;
        
        document.getElementById('wordCount').textContent = `${wordCount} words`;
        document.getElementById('charCount').textContent = `${charCount} characters`;
    }

    async generatePDF() {
        if (!this.currentContent.trim()) {
            this.showNotification('Please enter some markdown content first.', 'warning');
            return;
        }

        // Debug: Log content info
        console.log('=== PDF Generation Debug ===');
        console.log('Content length:', this.currentContent.length);
        console.log('First 100 chars:', this.currentContent.substring(0, 100));
        console.log('Content from editor:', document.getElementById('markdownEditor').value.length);

        const button = document.getElementById('generatePdfBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        // Show progress
        button.disabled = true;
        button.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Generating...</span>
        `;
        progressContainer.classList.remove('hidden');

        try {
            progressFill.style.width = '20%';
            progressText.textContent = 'Preparing content...';
            
            const theme = this.themes[this.currentTheme];
            
            // Create a container sized for A4 with proper styling
            // Convert mm to pixels (assuming 96 DPI: 1mm ≈ 3.7795px)
            const mmToPx = 3.7795;
            const containerWidth = Math.floor(210 * mmToPx); // A4 width in pixels
            const paddingPx = Math.floor(15 * mmToPx); // 15mm padding in pixels

            const pdfContainer = document.createElement('div');
            // Position on-screen but invisible - fixes html2canvas rendering issues
            pdfContainer.style.position = 'fixed';
            pdfContainer.style.top = '0';
            pdfContainer.style.left = '0';
            pdfContainer.style.width = `${containerWidth}px`;
            pdfContainer.style.padding = `${paddingPx}px`;
            pdfContainer.style.boxSizing = 'border-box';
            pdfContainer.style.backgroundColor = theme.styles.background;
            pdfContainer.style.fontFamily = theme.styles.font;
            pdfContainer.style.color = theme.styles.text;
            pdfContainer.style.lineHeight = '1.7';
            pdfContainer.style.zIndex = '-1000';
            pdfContainer.style.opacity = '0';
            pdfContainer.style.pointerEvents = 'none';

            // Apply the HTML content
            const html = marked.parse(this.currentContent);
            console.log('Parsed HTML length:', html.length);
            console.log('First 200 chars of HTML:', html.substring(0, 200));

            pdfContainer.innerHTML = this.getStyledHtmlForPDF(html, theme);

            document.body.appendChild(pdfContainer);

            // Wait for fonts and layout to be fully ready
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Container dimensions after append:', {
                scrollWidth: pdfContainer.scrollWidth,
                scrollHeight: pdfContainer.scrollHeight,
                offsetWidth: pdfContainer.offsetWidth,
                offsetHeight: pdfContainer.offsetHeight
            });

            progressFill.style.width = '50%';
            progressText.textContent = 'Capturing content...';

            // Render the entire content to canvas
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: theme.styles.background,
                logging: true,
                windowWidth: pdfContainer.scrollWidth,
                windowHeight: pdfContainer.scrollHeight
            });

            console.log('Canvas rendered:', {
                width: canvas.width,
                height: canvas.height,
                dataURL: canvas.toDataURL('image/png').substring(0, 100)
            });

            // Check if canvas is valid
            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                console.error('Canvas dimensions:', canvas ? `${canvas.width}x${canvas.height}` : 'null');
                console.error('Container dimensions:', `${pdfContainer.scrollWidth}x${pdfContainer.scrollHeight}`);
                throw new Error('Failed to render content to canvas. Please try again.');
            }

            progressFill.style.width = '75%';
            progressText.textContent = 'Creating PDF pages...';

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            // A4 dimensions
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 15;
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = pageHeight - (2 * margin);
            
            // Calculate scale
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;
            let pageNumber = 0;
            
            // TEST: Add visible text first (we know this works)
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0); // Red color so it's obvious
            pdf.text('=== YOUR MARKDOWN CONTENT BELOW ===', margin, margin + 5);

            // Add the canvas image below the text
            const imgData = canvas.toDataURL('image/png', 1.0);
            console.log('Canvas as PNG, length:', imgData.length);

            // Calculate how much space we need
            const textHeight = 10; // Space for our test text
            const availableHeight = contentHeight - textHeight;
            const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, availableHeight);

            try {
                // Try adding image with different parameters
                pdf.addImage(
                    imgData,           // image data
                    'PNG',             // format
                    margin,            // x position
                    margin + textHeight, // y position (below text)
                    imgWidth,          // width
                    imgHeight,         // height
                    undefined,         // alias
                    'SLOW'             // compression (SLOW = better quality)
                );
                console.log('✅ Image added to PDF');
            } catch (imgError) {
                console.error('❌ Failed to add image:', imgError);
                pdf.text('ERROR: Could not add image - ' + imgError.message, margin, margin + 20);
            }

            const pageNumber = 1;
            
            progressFill.style.width = '100%';
            progressText.textContent = 'PDF generated successfully!';
            
            // Save PDF
            const fileName = 'document_' + new Date().getTime() + '.pdf';
            pdf.save(fileName);
            
            // Cleanup
            document.body.removeChild(pdfContainer);
            
            this.showNotification(`PDF with ${pageNumber} page(s) generated! 📄`, 'success');
            this.updateConversionStats();
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            this.showNotification(`Error generating PDF: ${errorMessage}`, 'error');

            // Clean up container if it exists
            const container = document.body.querySelector('div[style*="z-index: -1000"]');
            if (container) {
                document.body.removeChild(container);
            }
        } finally {
            // Reset UI
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Generate PDF</span>
                `;
                progressContainer.classList.add('hidden');
                progressFill.style.width = '0%';
            }, 1500);
        }
    }

    getStyledHtmlForPDF(html, theme) {
        return `
            <div style="
                font-family: ${theme.styles.font};
                color: ${theme.styles.text};
                line-height: 1.7;
            ">
                <style>
                    h1, h2, h3, h4, h5, h6 {
                        color: ${theme.styles.heading};
                        font-weight: 600;
                        margin: 1.5rem 0 0.75rem 0;
                    }
                    h1 { font-size: 2.25rem; margin-top: 0; }
                    h2 { font-size: 1.875rem; }
                    h3 { font-size: 1.5rem; }
                    p { margin: 0.75rem 0; }
                    code {
                        background: ${theme.styles.secondary}20;
                        color: ${theme.styles.accent};
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.875rem;
                    }
                    pre {
                        background: ${theme.styles.secondary}20;
                        padding: 1rem;
                        border-radius: 8px;
                        overflow-x: auto;
                        margin: 1rem 0;
                    }
                    pre code {
                        background: transparent;
                        padding: 0;
                    }
                    blockquote {
                        border-left: 4px solid ${theme.styles.accent};
                        padding-left: 1rem;
                        margin: 1rem 0;
                        font-style: italic;
                        color: ${theme.styles.secondary};
                    }
                    a {
                        color: ${theme.styles.accent};
                        text-decoration: none;
                    }
                    ul, ol {
                        margin: 0.75rem 0;
                        padding-left: 1.5rem;
                    }
                    li {
                        margin: 0.25rem 0;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1rem 0;
                    }
                    th, td {
                        border: 1px solid ${theme.styles.secondary}40;
                        padding: 0.5rem;
                        text-align: left;
                    }
                    th {
                        background: ${theme.styles.secondary}20;
                        font-weight: 600;
                    }
                    hr {
                        border: none;
                        border-top: 2px solid ${theme.styles.secondary}40;
                        margin: 2rem 0;
                    }
                </style>
                ${html}
            </div>
        `;
    }

    loadSampleContent() {
        const sampleMarkdown = `# Sample Document: The Art of Markdown 📝

## Introduction

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. Created by John Gruber in 2004, Markdown is now one of the world's most popular markup languages. ✨

## Why Use Markdown? 🤔

### Simplicity
Markdown's syntax is simple and intuitive. You can learn the basics in just a few minutes. 🎯

### Portability
Markdown files are plain text, so they work on any device and platform. 💻📱

### Flexibility
You can convert Markdown to many formats including HTML, PDF, and rich text. 🔄

## Basic Syntax

### Text Formatting

**Bold text** with double asterisks.
*Italic text* with single asterisks.
***Bold and italic*** with triple asterisks.

### Emoji Support 🎉

You can use emoji in your markdown documents! Here are some examples:
- 📊 Charts and graphs
- 🚀 Launch and progress
- ✅ Completed tasks
- ⚠️ Warnings
- 💡 Ideas and tips
- 🎨 Creative work
- 📱 Mobile and tech
- 🌟 Featured content

### Code

Inline \`code\` with backticks.

\`\`\`javascript
// Code block
function hello() {
    console.log("Hello, World! 👋");
}
\`\`\`

### Blockquotes

> This is a blockquote. 💬
> It can span multiple lines.
> 
> *— Someone Important*

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Emoji   | ✅     | High 🔥  |
| Tables  | ✅     | Medium   |
| Images  | ✅     | Low      |

---

*This sample demonstrates Markdown features with emoji support! 🎉*

**Note:** All emoji and styling will be preserved in your PDF! 📄✨`;

        document.getElementById('markdownEditor').value = sampleMarkdown;
        this.currentContent = sampleMarkdown;
        this.updatePreview();
        this.updateWordCount();
    }

    initializeStatsChart() {
        const chartDom = document.getElementById('statsChart');
        const myChart = echarts.init(chartDom);

        const option = {
            title: {
                text: 'Monthly Conversion Statistics',
                left: 'center',
                textStyle: {
                    fontSize: 18,
                    fontWeight: 'normal',
                    color: '#2C2C2C'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#C4856A'
                    }
                }
            },
            legend: {
                data: ['Conversions', 'Active Users', 'Documents Generated'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Conversions',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        color: '#C4856A'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(196, 133, 106, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(196, 133, 106, 0.1)'
                            }]
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [1200, 1350, 1100, 1800, 2100, 2400, 2200, 2600, 2800, 3200, 3000, 3400]
                },
                {
                    name: 'Active Users',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        color: '#6B6B6B'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(107, 107, 107, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(107, 107, 107, 0.1)'
                            }]
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [800, 950, 750, 1200, 1400, 1600, 1500, 1700, 1800, 2100, 2000, 2300]
                },
                {
                    name: 'Documents Generated',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        color: '#E8EDE9'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(232, 237, 233, 0.3)'
                            }, {
                                offset: 1, color: 'rgba(232, 237, 233, 0.1)'
                            }]
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: [600, 700, 550, 900, 1050, 1200, 1100, 1300, 1400, 1600, 1500, 1700]
                }
            ]
        };

        myChart.setOption(option);

        // Make chart responsive
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    }

    updateConversionStats() {
        // This would typically update a database or local storage
        // For demo purposes, we'll just show a notification
        console.log('Conversion statistics updated');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function scrollToConverter() {
    document.getElementById('converter').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function loadSample() {
    if (window.converter) {
        window.converter.loadSampleContent();
        window.converter.showNotification('Sample content loaded! 🎉', 'success');
    }
}

function clearEditor() {
    document.getElementById('markdownEditor').value = '';
    if (window.converter) {
        window.converter.currentContent = '';
        window.converter.updatePreview();
        window.converter.updateWordCount();
    }
}

function downloadMarkdown() {
    if (!window.converter || !window.converter.currentContent.trim()) {
        alert('No content to download. Please write some markdown first.');
        return;
    }
    
    const blob = new Blob([window.converter.currentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.converter.showNotification('Markdown file downloaded! 📥', 'success');
}

function generatePDF() {
    if (window.converter) {
        window.converter.generatePDF();
    }
}

function togglePreviewMode() {
    const preview = document.getElementById('previewContent');
    preview.classList.toggle('print-preview');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new MarkdownPDFConverter();
});
