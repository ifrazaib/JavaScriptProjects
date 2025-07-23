 class StudentManager {
            constructor() {
                this.students = [];
                this.filteredStudents = [];
                this.editingIndex = -1;
                this.currentPage = 1;
                this.studentsPerPage = 5;
                
                this.loadFromLocalStorage();
                this.initializeEventListeners();
                this.displayStudents();
                
                // Console logging for debugging
                console.log(' Student Management System Initialized');
                console.log('Available console commands:');
                console.log('- studentManager.getAllStudents() - Get all students');
                console.log('- studentManager.getStudentCount() - Get total count');
                console.log('- studentManager.searchStudents("name") - Search students');
                console.log('- studentManager.exportData() - Export student data');
                console.log('- studentManager.importData(data) - Import student data');
            }

            initializeEventListeners() {
                // Form submission
                document.getElementById('studentForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleFormSubmit();
                });

                // Search functionality
                document.getElementById('searchInput').addEventListener('input', (e) => {
                    this.searchStudents(e.target.value);
                });

                // Cancel button
                document.getElementById('cancelBtn').addEventListener('click', () => {
                    this.cancelEdit();
                });
            }

            handleFormSubmit() {
                const formData = this.getFormData();
                
                if (!this.validateForm(formData)) {
                    return;
                }

                if (this.editingIndex >= 0) {
                    this.updateStudent(formData);
                } else {
                    this.addStudent(formData);
                }

                this.resetForm();
                this.saveToLocalStorage();
                this.displayStudents();
            }

            getFormData() {
                return {
                    name: document.getElementById('studentName').value.trim(),
                    age: parseInt(document.getElementById('age').value),
                    gender: document.getElementById('gender').value,
                    grade: document.getElementById('grade').value.trim(),
                    subjects: document.getElementById('subjects').value.trim().split(',').map(s => s.trim()).filter(s => s !== '')
                };
            }

            validateForm(data) {
                // Check for empty fields
                if (!data.name || !data.age || !data.gender || !data.grade || data.subjects.length === 0) {
                    alert('Please fill in all required fields!');
                    return false;
                }

                // Check for duplicate names (only when adding, not editing)
                if (this.editingIndex === -1) {
                    const duplicate = this.students.find(student => 
                        student.name.toLowerCase() === data.name.toLowerCase()
                    );
                    
                    if (duplicate) {
                        alert('A student with this name already exists!');
                        return false;
                    }
                }

                // Age validation
                if (data.age < 1 || data.age > 100) {
                    alert('Please enter a valid age between 1 and 100!');
                    return false;
                }

                console.log('Form validation passed:', data);
                return true;
            }

            addStudent(data) {
                const student = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString()
                };

                this.students.push(student);
                console.log('Student added:', student);
                alert('Student added successfully!');
            }

            updateStudent(data) {
                if (this.editingIndex >= 0 && this.editingIndex < this.students.length) {
                    this.students[this.editingIndex] = {
                        ...this.students[this.editingIndex],
                        ...data,
                        updatedAt: new Date().toISOString()
                    };
                    
                    console.log('Student updated:', this.students[this.editingIndex]);
                    alert('Student updated successfully!');
                    this.editingIndex = -1;
                }
            }

            editStudent(index) {
                if (index >= 0 && index < this.filteredStudents.length) {
                    const student = this.filteredStudents[index];
                    const originalIndex = this.students.findIndex(s => s.id === student.id);
                    this.editingIndex = originalIndex;

                    // Populate form
                    document.getElementById('studentName').value = student.name;
                    document.getElementById('age').value = student.age;
                    document.getElementById('gender').value = student.gender;
                    document.getElementById('grade').value = student.grade;
                    document.getElementById('subjects').value = student.subjects.join(', ');

                    // Change button text and show cancel
                    document.getElementById('submitBtn').textContent = 'Update Student';
                    document.getElementById('cancelBtn').style.display = 'inline-block';

                    console.log(' Editing student:', student);
                    
                    // Scroll to form
                    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
                }
            }

            deleteStudent(index) {
                if (index >= 0 && index < this.filteredStudents.length) {
                    const student = this.filteredStudents[index];
                    
                    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
                        const originalIndex = this.students.findIndex(s => s.id === student.id);
                        const deletedStudent = this.students.splice(originalIndex, 1)[0];
                        
                        console.log('Student deleted:', deletedStudent);
                        alert('Student deleted successfully!');
                        
                        this.saveToLocalStorage();
                        this.displayStudents();
                    }
                }
            }

            searchStudents(query) {
                const searchTerm = query.toLowerCase().trim();
                
                if (searchTerm === '') {
                    this.filteredStudents = [...this.students];
                } else {
                    this.filteredStudents = this.students.filter(student =>
                        student.name.toLowerCase().includes(searchTerm) ||
                        student.grade.toLowerCase().includes(searchTerm) ||
                        student.subjects.some(subject => subject.toLowerCase().includes(searchTerm))
                    );
                }

                console.log(' Search results:', this.filteredStudents);
                this.currentPage = 1;
                this.displayStudents();
            }

            sortStudents(field, order) {
                this.filteredStudents.sort((a, b) => {
                    let aValue = field === 'age' ? a[field] : a[field].toLowerCase();
                    let bValue = field === 'age' ? b[field] : b[field].toLowerCase();

                    if (order === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });

                console.log(' Students sorted by', field, order);
                this.currentPage = 1;
                this.displayStudents();
            }

            displayStudents() {
                const tbody = document.getElementById('studentsTableBody');
                
                if (this.filteredStudents.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students found. Add some students to get started! </td></tr>';
                    document.getElementById('pagination').style.display = 'none';
                    return;
                }

                // Calculate pagination
                const totalPages = Math.ceil(this.filteredStudents.length / this.studentsPerPage);
                const startIndex = (this.currentPage - 1) * this.studentsPerPage;
                const endIndex = startIndex + this.studentsPerPage;
                const currentStudents = this.filteredStudents.slice(startIndex, endIndex);

                tbody.innerHTML = currentStudents.map((student, index) => {
                    const actualIndex = startIndex + index;
                    const subjectsHtml = student.subjects.map(subject => 
                        `<span class="subject-tag">${subject}</span>`
                    ).join('');

                    return `
                        <tr class="fade-in">
                            <td>${actualIndex + 1}</td>
                            <td><strong>${student.name}</strong></td>
                            <td>${student.age}</td>
                            <td>${student.gender}</td>
                            <td>${student.grade}</td>
                            <td><div class="subjects-list">${subjectsHtml}</div></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="studentManager.editStudent(${actualIndex})"> Edit</button>
                                    <button class="btn btn-danger btn-sm" onclick="studentManager.deleteStudent(${actualIndex})"> Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Show pagination if needed
                if (totalPages > 1) {
                    this.displayPagination(totalPages);
                    document.getElementById('pagination').style.display = 'flex';
                } else {
                    document.getElementById('pagination').style.display = 'none';
                }

                console.log(' Displayed students:', currentStudents.length, 'of', this.filteredStudents.length);
            }

            displayPagination(totalPages) {
                const pagination = document.getElementById('pagination');
                let paginationHTML = '';

                // Previous button
                paginationHTML += `<button onclick="studentManager.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>‹ Previous</button>`;

                // Page numbers
                for (let i = 1; i <= totalPages; i++) {
                    paginationHTML += `<button onclick="studentManager.goToPage(${i})" class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
                }

                // Next button
                paginationHTML += `<button onclick="studentManager.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;

                pagination.innerHTML = paginationHTML;
            }

            goToPage(page) {
                const totalPages = Math.ceil(this.filteredStudents.length / this.studentsPerPage);
                
                if (page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.displayStudents();
                    console.log(' Navigated to page:', page);
                }
            }

            cancelEdit() {
                this.editingIndex = -1;
                this.resetForm();
                console.log(' Edit cancelled');
            }

            resetForm() {
                document.getElementById('studentForm').reset();
                document.getElementById('submitBtn').textContent = 'Add Student';
                document.getElementById('cancelBtn').style.display = 'none';
            }

            clearAllStudents() {
                if (this.students.length === 0) {
                    alert('No students to clear!');
                    return;
                }

                if (confirm(`Are you sure you want to delete all ${this.students.length} students? This action cannot be undone!`)) {
                    this.students = [];
                    this.filteredStudents = [];
                    this.currentPage = 1;
                    this.editingIndex = -1;
                    
                    this.resetForm();
                    this.saveToLocalStorage();
                    this.displayStudents();
                    
                    document.getElementById('searchInput').value = '';
                    
                    console.log('🧹 All students cleared');
                    alert('All students have been deleted!');
                }
            }

            saveToLocalStorage() {
                try {
                    localStorage.setItem('studentManagerData', JSON.stringify(this.students));
                    console.log(' Data saved to localStorage');
                } catch (error) {
                    console.error(' Failed to save to localStorage:', error);
                }
            }

            loadFromLocalStorage() {
                try {
                    const data = localStorage.getItem('studentManagerData');
                    if (data) {
                        this.students = JSON.parse(data);
                        this.filteredStudents = [...this.students];
                        console.log(' Data loaded from localStorage:', this.students.length, 'students');
                    } else {
                        this.filteredStudents = [];
                    }
                } catch (error) {
                    console.error(' Failed to load from localStorage:', error);
                    this.students = [];
                    this.filteredStudents = [];
                }
            }

            // Console helper methods
            getAllStudents() {
                console.table(this.students);
                return this.students;
            }

            getStudentCount() {
                const count = this.students.length;
                console.log(' Total students:', count);
                return count;
            }

            exportData() {
                const data = JSON.stringify(this.students, null, 2);
                console.log('Student data exported:');
                console.log(data);
                return data;
            }

            importData(data) {
                try {
                    const imported = JSON.parse(data);
                    if (Array.isArray(imported)) {
                        this.students = imported;
                        this.filteredStudents = [...this.students];
                        this.saveToLocalStorage();
                        this.displayStudents();
                        console.log(' Data imported successfully:', imported.length, 'students');
                        return true;
                    } else {
                        console.error('Invalid data format');
                        return false;
                    }
                } catch (error) {
                    console.error(' Failed to import data:', error);
                    return false;
                }
            }
        }

        // Global functions for button events
        function sortStudents(field, order) {
            studentManager.sortStudents(field, order);
        }

        function clearAllStudents() {
            studentManager.clearAllStudents();
        }

        // Initialize the application
        let studentManager;
        
        document.addEventListener('DOMContentLoaded', () => {
            studentManager = new StudentManager();
            
            // Make studentManager globally accessible for console commands
            window.studentManager = studentManager;
        });

        // Console welcome message
        console.log('%cStudent Management System', 'color: #667eea; font-size: 24px; font-weight: bold;');
        console.log('%cSystem loaded! Try these commands:', 'color: #764ba2; font-size: 14px;');
        console.log('%c• studentManager.getAllStudents()', 'color: #333; font-family: monospace;');
        console.log('%c• studentManager.getStudentCount()', 'color: #333; font-family: monospace;');
        console.log('%c• studentManager.exportData()', 'color: #333; font-family: monospace;');