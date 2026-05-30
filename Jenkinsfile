pipeline {
    agent any

    stages {
        stage('1. Tai Code (Checkout)') {
            steps {
                echo 'Dang tai ma nguon moi nhat tu Git...'
                checkout scm
            }
        }

        stage('2. Cai Thu Vien (Install)') {
            steps {
                echo 'Dang cai dat cac thu vien Node.js...'
                sh 'npm install'
            }
        }

        stage('3. Bien Dich (Build)') {
            steps {
                echo 'Dang bien dich ung dung Next.js...'
                sh 'npm run build'
            }
        }

        stage('4. Kiem Tra Code (Lint)') {
            steps {
                echo 'Dang chay kiem tra tieu chuan code (ESLint)...'
                sh 'npm run lint || true'
            }
        }
    }
}
