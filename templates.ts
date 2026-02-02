import { UserProfile, TemplateStyle } from "./types";
import { INITIAL_SERVICES as SERVICE_DB } from "./constants";

export const generateGdprEmail = (
  serviceName: string, 
  user: UserProfile
): { subject: string; body: string } => {
  
  const style = user.templateStyle || 'LEGAL';
  
  // --- CLAUSE BUILDING BLOCKS ---

  // 1. The "P.S." - The human element (The USP)
  const psBlock = user.language === 'DE'
    ? `P.S.: Bitte verstehen Sie dies keinesfalls als Unzufriedenheit mit Ihrem Service. Doch aufgrund des massiven "Data Minings", der Einführung digitaler IDs und der Zunahme von KI-gestützter Kriminalität fühle ich mich einfach nicht mehr sicher, wenn meine Daten überall verstreut sind.\n\nVielen Dank für Ihr Verständnis. :)`
    : `P.S.: Please do not take this in any way as a displeasure for your services, but due to the massive data mining, digital ID rollouts, and the uptake in AI-cybercrime, I simply no longer feel safe having my data stored everywhere.\n\nThank you for your understanding. :)`;

  // 2. The EU Context - Standardized for ALL styles
  // Only generated if user is EU citizen
  const euContext = user.isEuCitizen 
    ? (user.language === 'DE' 
        ? "Als Bürger der Europäischen Union übe ich hiermit meine Rechte gemäß der Datenschutz-Grundverordnung (DSGVO) aus." 
        : "As a Citizen of the European Union, I am exercising my rights under the General Data Protection Regulation (GDPR).")
    : "";

  // 3. Speculative Clause (Shadow Profiles)
  const speculativeClause = user.includeSpeculative
    ? (user.language === 'DE' 
        ? `\nSollte ich kein aktives Konto bei Ihnen haben, prüfen Sie bitte dennoch Ihre Datenbanken auf "Schattenprofile", Marketing-Listen oder Datensätze Dritter, die meinen Daten entsprechen.`
        : `\nIf I do not have an active account, please check for any "shadow profiles", marketing leads, or third-party data entries matching my details.`)
    : ``;

  // --- TEMPLATE LOGIC ---

  // === GERMAN (DE) ===
  if (user.language === 'DE') {
    // STYLE: "SIMPLE" (The Personal USP Style)
    if (style === 'SIMPLE') {
      return {
        subject: `Antrag auf Löschung personenbezogener Daten (Art. 17 DSGVO)`,
        body: `
Sehr geehrtes Support-Team,

${euContext}

Ich schreibe Ihnen, um formell die Löschung meines Kontos und aller damit verbundenen personenbezogenen Daten zu beantragen.

In Übereinstimmung mit den geltenden Datenschutzbestimmungen (insb. Artikel 17 DSGVO - "Recht auf Vergessenwerden") widerrufe ich hiermit meine Einwilligung zur Verarbeitung meiner Daten.

Meine Daten:
Name: ${user.fullName}
Email: ${user.email}
${user.address ? `Adresse: ${user.address}` : ''}

Die Daten sind für die ursprünglichen Zwecke nicht mehr notwendig.

Ich bitte Sie höflich, ALLE PERSONENBEZOGENEN DATEN zu löschen – dies umfasst nicht nur Kontodetails, sondern auch Adressdaten, Bestellhistorien, Transaktionsdaten und alle anderen Informationen, die Sie gespeichert haben.${speculativeClause}

Bitte bestätigen Sie mir kurz die erfolgreiche Löschung oder informieren Sie mich, falls weitere Schritte notwendig sind.

Vielen Dank und eine schöne Woche.

Mit freundlichen Grüßen,

${user.fullName}

${psBlock}
        `.trim()
      };
    }

    // STYLE: "LEGAL" (Standard German Legalese)
    if (style === 'LEGAL') {
       return {
        subject: `Rechtliche Aufforderung: Löschung nach Art. 17 DSGVO - ${user.fullName}`,
        body: `
An den Datenschutzbeauftragten von ${serviceName},

${euContext}

Hiermit mache ich von meinem Recht auf Löschung gemäß Art. 17 DSGVO Gebrauch.

Ich fordere Sie auf, unverzüglich alle personenbezogenen Daten zu löschen, die Sie über mich gespeichert haben. Dies betrifft auch alle Daten, die an Dritte weitergegeben wurden (Art. 17 Abs. 2 DSGVO).

Gleichzeitig übe ich folgende Rechte aus:
1. Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO).
2. Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).

Identifikation:
Name: ${user.fullName}
Email: ${user.email}
${user.address ? `Adresse: ${user.address}` : ''}
${user.phone ? `Telefon: ${user.phone}` : ''}
${speculativeClause}

Ich erwarte eine Bestätigung der Löschung innerhalb der gesetzlichen Frist von einem Monat.

Mit freundlichen Grüßen,

${user.fullName}
        `.trim()
      };
    }

    // STYLE: "AGGRESSIVE" (German)
    return {
      subject: `RECHTSANSPRUCH: SOFORTIGE LÖSCHUNG (ART. 17 DSGVO)`,
      body: `
DRINGEND: RECHTSABTEILUNG / DATENSCHUTZ

An ${serviceName},

${euContext}

Ich fordere hiermit die SOFORTIGE und UNWIDERRUFLICHE LÖSCHUNG aller mich betreffenden Daten.

Rechtsgrundlage:
- Artikel 17 DSGVO ("Recht auf Vergessenwerden")
- Artikel 21 DSGVO (Widerspruchsrecht)

IDENTIFIKATION:
Name: ${user.fullName}
Email: ${user.email}
${user.address ? `Adresse: ${user.address}` : ''}

FORDERUNGEN:
1. Löschen Sie dauerhaft alle Datensätze, die mit diesen Identifikatoren verknüpft sind.
2. Entfernen Sie alle "Schattenprofile" oder Marketinglisten.${speculativeClause}
3. Bestätigen Sie die Löschung schriftlich innerhalb der gesetzlichen Frist.

Sollten Sie dieser Aufforderung nicht nachkommen, werde ich Beschwerde bei der zuständigen Aufsichtsbehörde einreichen.

Mit freundlichen Grüßen,

${user.fullName}
      `.trim()
    };
  }

  // === ENGLISH (EN) ===

  // STYLE: "SIMPLE" (The USP / Personal Style)
  if (style === 'SIMPLE') {
    return {
      subject: `Request for Deletion of Personal Data after Art. 17 of GDPR`,
      body: `
Dear Support Team,

${euContext}

I am writing to formally request the deletion of my Account and all personal data associated with me.

In accordance with applicable data protection regulations (specifically GDPR Article 17 the "Right to erasure / right to be forgotten"), the data is no longer necessary, and I explicitly withdraw my consent and hereby enact my right to be forgotten.

Relevant details:
Full Name: ${user.fullName}
Email Address/Username: ${user.email}
${user.address ? `Address: ${user.address}` : ''}

I kindly ask that you remove ALL PERSONAL DATA, including but not limited to account details, address, order data, transaction history, and any other information you may have stored.${speculativeClause}

I kindly request you to confirm once the deletion has been completed or inform me if further information is required to process my request.

Thank you and have a nice week.

Sincerely,

${user.fullName}

${psBlock}
      `.trim()
    };
  }

  // STYLE: "AGGRESSIVE" (For Data Brokers)
  if (style === 'AGGRESSIVE') {
    return {
      subject: `LEGAL DEMAND: IMMEDIATE ERASURE OF PERSONAL DATA (GDPR/CCPA)`,
      body: `
URGENT: LEGAL / PRIVACY DEPARTMENT

To ${serviceName},

${euContext}

I am writing to formally DEMAND the IMMEDIATE ERASURE of all personal data identifying me.

I am exercising my rights under:
- GDPR Article 17 ("Right to be Forgotten")
- CCPA (California Consumer Privacy Act) "Right to Delete"

MY IDENTIFIERS:
Name: ${user.fullName}
Email: ${user.email}
${user.address ? `Address: ${user.address}` : ''}
${user.phone ? `Phone: ${user.phone}` : ''}

DEMANDS:
1. PERMANENTLY DELETE all records associated with these identifiers.
2. DELETE any "shadow profiles", marketing lists, or inferred data.${speculativeClause}
3. DO NOT SELL or share my information with third parties.
4. CONFIRM deletion in writing within the statutory timeframe.

Failure to comply will result in a formal complaint to the relevant Data Protection Authorities.

Sincerely,

${user.fullName}
      `.trim()
    };
  }

  // STYLE: "LEGAL" (Default Professional)
  return {
    subject: `Formal Request: Right to Erasure of Personal Data - ${user.fullName}`,
    body: `
To the Data Protection Officer at ${serviceName},

${euContext}

In accordance with Article 17 of the General Data Protection Regulation (GDPR) and/or the CCPA, I hereby withdraw my consent and request the erasure of my personal data.

Subject Details:
Name: ${user.fullName}
Email: ${user.email}
${user.address ? `Address: ${user.address}` : ''}

I request that you:
1. Delete my account and all associated personal data.
2. Remove my email address from all marketing lists.
3. Ensure this request applies to any third-party data processors you utilize.

Please provide written confirmation that this action has been completed.

Sincerely,

${user.fullName}
    `.trim()
  };
};