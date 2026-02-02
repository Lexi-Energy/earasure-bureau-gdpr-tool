
**The Erasure Bureau ( ⌐■_■ )**

This tool generates deletion request emails (.eml) in bulk for thousands of data brokers, ad-tech companies, and service providers. It runs entirely in your browser. Zero data leaves your device.
Manually writing emails to 3,000+ of them is impossible. So this creates the right mails to the right mail.

( ╯°□°)╯ ┻━━┻

**A static, zero-knowledge client for mass-generating GDPR Article 17 ("Right to Erasure") requests.**

This is a simple tool designed to help you exercise your data rights without leaking your personal data to yet another server. It runs entirely in your browser. Nothing you type leaves your device until you hit send in your own email client.

----------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------

**( o_o) Why?**

Data brokers, ad-tech vendors, and scraping bots trade your profile every millisecond. The laws (GDPR, CCPA) say you can stop them, but they count on the process being too annoying for you to bother.

This tool removes the friction. It matches your profile against a database of ~3,000 known data collectors and generates the legal text for you.


**¯_(ツ)_/¯ How it works**

**Profile**: You enter your details (Name, Email). This stays in your RAM.

**Discovery**: You select targets from the list.

Includes major platforms (Meta, Google).

Includes hidden Ad-Tech vendors (Criteo, OpenX).

Includes confirmed Data Brokers (Acxiom, Spokeo).

**Execution**: The tool generates .eml files or mailto: links.

Send: You drop them in bulk in your mail drafts older and hit send. (recommend selecting between 20-30 and wating a little - spam rules are a dicks)


----------------------------------------------------------------------------------------------------------------------------------------------------
**( >_<) Zero Knowledge Promise
**No Database: Nobody stores your data.

****No Analytics**: The tool cannot track what companies you select. OR your name or anything. It is ALL LOCAL and just used to put into the Templates.**

**No Backend:** The entire app is a static React bundle. You can audit the code; there are no API calls sending your profile outwards.

----------------------------------------------------------------------------------------------------------------------------------------------------


ERASURE BUREAU

      (TvT ) 
     --| |--     [ DELETE. EVERYTHING. ]
       | | 
      /   \


(^_^)b Installation & Dev
If you want to run this locally or fork it:


   # 1. Clone the repo
   git clone https://github.com/Lexi-Energy/earasure-bureau-gdpr-tool

   # 2. Install dependencies
   cd erasure-bureau
   npm install
   
   # 3. Build the database (fetches fresh targets)
   node scripts/update-db.js
   
   # 4. Run locally
   npm run dev
   
   # The Erasure Bureau   

----------------------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------------------

**( O.O) Credits & Data Sources**
This tool stands on the shoulders of giants. I do not maintain the address data manually; I aggregate it from the hard work of privacy activists:

**Datenanfragen.de: The primary source for EU/GDPR contacts. (CC0 License)** (Grüße nach Deutschland)

California Data Broker Registry: Source for US broker data.

SimpleOptOut / PrivacySpy: Additional community lists.


**( u_u) Disclaimer**

Not Legal Advice: This tool generates template text based on standard regulations. **I am a girl with a bone to pick with BIG TECH, not a lawyer! **

Be Reasonable: Don't spam small businesses who clearly don't have your data. Use the "Speculative" mode responsibly.
