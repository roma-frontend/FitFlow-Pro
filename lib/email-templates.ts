// lib/email-templates.ts
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface TemplateData {
  [key: string]: any;
}

export class EmailTemplateEngine {
  private static replaceVariables(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  static getWelcomeTemplate(data: {
    name: string;
    userType: string;
    companyName: string;
    loginUrl: string;
  }): EmailTemplate {
    const subject = `Добро пожаловать в {{companyName}}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{subject}}</title>
        <!-- CSS стили здесь -->
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Добро пожаловать в {{companyName}}!</h1>
            <p>Спасибо за регистрацию {{userType}}</p>
          </div>
          
          <div class="content">
            <h2>Привет, {{name}}!</h2>
            <p>Мы рады приветствовать вас в нашей системе {{companyName}}.</p>
            
            <div style="text-align: center;">
              <a href="{{loginUrl}}" class="button">Войти в систему</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Добро пожаловать в {{companyName}}, {{name}}!
      
      Мы рады приветствовать вас как {{userType}}.
      
      Войти в систему: {{loginUrl}}
      
      С уважением,
      Команда {{companyName}}
    `;

    return {
      subject: this.replaceVariables(subject, data),
      html: this.replaceVariables(html, data),
      text: this.replaceVariables(text, data)
    };
  }
}
