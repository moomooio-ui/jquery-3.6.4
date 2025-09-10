// ==UserScript==
// @name         white list test versao com senha
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Sistema de senha com expiração de 20 segundos e modal elegante
// @author       Você
// @match        https://*.moomoo.io/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// ==/UserScript==

(function() {
    'use strict';
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(50, 50, 50, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: Arial, sans-serif;
            }
            
            .auth-content {
                background: #2c3e50;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                text-align: center;
                width: 400px;
                color: white;
                border: 2px solid #34495e;
            }
            
            .auth-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #ecf0f1;
            }
            
            .auth-message {
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.5;
                color: #bdc3c7;
            }
            
            .auth-discord-info {
                background: #7289da;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .auth-discord-link {
                color: #fff;
                text-decoration: underline;
                cursor: pointer;
                font-weight: bold;
            }
            
            .auth-discord-link:hover {
                color: #99aab5;
            }
            
            .auth-channel-id {
                background: #23272a;
                padding: 8px;
                border-radius: 4px;
                margin: 10px 0;
                font-family: monospace;
                color: #7289da;
                font-weight: bold;
            }
            
            .auth-input {
                width: 100%;
                padding: 12px;
                border: 2px solid #34495e;
                border-radius: 8px;
                font-size: 16px;
                margin-bottom: 20px;
                background: #34495e;
                color: white;
                outline: none;
                transition: border-color 0.3s;
                box-sizing: border-box;
            }
            
            .auth-input:focus {
                border-color: #3498db;
                background: #2c3e50;
            }
            
            .auth-input::placeholder {
                color: #95a5a6;
            }
            
            .auth-button {
                background: #27ae60;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
                width: 100%;
                box-sizing: border-box;
                margin-bottom: 10px;
            }
            
            .auth-button:hover {
                background: #2ecc71;
            }
            
            .auth-secondary-button {
                background: #34495e;
                color: #bdc3c7;
                border: 1px solid #2c3e50;
            }
            
            .auth-secondary-button:hover {
                background: #2c3e50;
                color: #ecf0f1;
            }
            
            .auth-error {
                color: #e74c3c;
                font-size: 14px;
                margin-top: 10px;
                display: none;
            }
            
            .auth-timer {
                font-size: 12px;
                color: #95a5a6;
                margin-top: 10px;
            }
            
            .auth-locked {
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    function sendToWebhook(content, webhookUrl) {
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({content: content})
        })
        .catch(error => {
        });
    }

    function generatePasscode() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 12) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    function generateId() {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 4) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    function createAuthModal(tmpID, tmpPASS, callback) {
        document.body.style.overflow = 'hidden';
        
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
             <div class="auth-content">
                <div class="auth-title">WHITE LIST</div>

                <div class="auth-discord-info">
                  <strong>Como obter a senha:</strong>
                    <br>1. Abra o Discord no navegador
                    <br>2. Entre no servidor(mod br)
                    <br>3. Vá para o canal:
                    <div class="auth-channel-id">Nome do Canal: Senhas</div>
                    <br>4. Copie a senha mais recente
                </div>

                <div class="auth-message">
                    Digite a senha recebida no Discord:<br>
                    <strong>ID da Sessão: ${tmpID}</strong>
                </div>

                <input type="password" class="auth-input" placeholder="Digite a senha aqui..." autocomplete="off" id="authInput">
                <div class="auth-error" id="authError">Senha incorreta! Verifique o Discord e tente novamente.</div>

                <button class="auth-button" id="authSubmitBtn">VERIFICAR AUTENTICAÇÃO</button>

                <button class="auth-button auth-secondary-button" id="authOpenDiscordBtn">
                   ABRIR DISCORD
                </button>

                <div class="auth-timer">⚠️ Esta senha expira em 20 segundos após ser gerada</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('authInput');
        input.focus();
        
        const submitBtn = document.getElementById('authSubmitBtn');
        submitBtn.addEventListener('click', function() {
            handleAuthSubmit(tmpPASS, modal, callback);
        });
        
        const discordBtn = document.getElementById('authOpenDiscordBtn');
        discordBtn.addEventListener('click', function() {
            window.open('https://discord.com/channels/@me', '_blank');
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAuthSubmit(tmpPASS, modal, callback);
            }
        });
    }

    function handleAuthSubmit(correctPassword, modal, callback) {
        const input = document.getElementById('authInput');
        const error = document.getElementById('authError');
        const userInput = input.value.trim();
        
        if (userInput === correctPassword) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
            if (callback) {
                callback(true);
            }
        } else {
            error.style.display = 'block';
            input.value = '';
            input.focus();
        }
    }

    function initializePasswords() {
  const webhookUrl = "https://discord.com/api/webhooks/1415457361702813858/uSK1Pl5PyeSF1uEjkJaz9A7jZY8SPAX5K9plwYNn4IcodESUlOrKv9SgddHCSX5iV_mg";
        const tmpID = generateId();
        const tmpPASS = generatePasscode();

        localStorage.setItem('auth_id', tmpID);
        localStorage.setItem('auth_pass', tmpPASS);
        localStorage.setItem('auth_timestamp', Date.now().toString());

        sendToWebhook(`SENHA GERADA\nID: \`${tmpID}\` | SENHA: \`${tmpPASS}\`\nSite: ${window.location.href}\nExpira em: 20 segundos\nCanal: 1415457187446132868`, webhookUrl);

        createAuthModal(tmpID, tmpPASS, function(success) {
            if (success) {
                localStorage.setItem('authenticated', 'true');
                console.log('Autenticação bem-sucedida!');
            }
        });
    }

    function isAuthExpired() {
        const authTimestamp = localStorage.getItem('auth_timestamp');
        if (!authTimestamp) return true;
        
        const currentTime = Date.now();
        const elapsedTime = currentTime - parseInt(authTimestamp);
        
        return elapsedTime > 20000;
    }

    addStyles();

    window.addEventListener('load', function() {
        if (isAuthExpired() || localStorage.getItem('authenticated') !== 'true') {
            if (isAuthExpired()) {
                localStorage.removeItem('authenticated');
                localStorage.removeItem('auth_id');
                localStorage.removeItem('auth_pass');
                localStorage.removeItem('auth_timestamp');
            }
            
            setTimeout(initializePasswords, 2000);
        }
    });

})();
