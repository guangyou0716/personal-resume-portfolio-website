-- Pending remote D1 content update for gy-portfolio-db / portfolio_profile
-- DO NOT APPLY until the user approves a deploy / remote D1 write.
-- Do not print API tokens or the editor password.
--
-- Context (read-only check on 2026-11-17, Asia/Kuala_Lumpur):
--   Remote portfolio_profile currently has 0 rows. The live site
--   https://gy-portfolio.guangyou.workers.dev therefore serves
--   app/data/profile.ts defaults via getProfile() fallback.
--   This script upserts the corrected content so D1 becomes the
--   stored source of truth after approval.
--
-- Database: gy-portfolio-db (a924e194-6269-40d2-80ff-b4fafbe4f3af)
-- Account:  b362ee4c944e19c284333759133b9924
--
-- Changes vs current live / current defaults:
--   5) Bioenergy (Mar 2024 – Present) bullets, tense only:
--      "Developed and maintained PHP-based..." -> "Develop and maintain PHP-based..."
--      "Contributed to PayNet DuitNow..."      -> "Contribute to PayNet DuitNow..."
--      "Supported smart meter power..."        -> "Support smart meter power..."
--      "Supported industrial production..."    -> "Support industrial production..."
--   6) Consistency:
--      "Boon Siew Honda Sdn. Bhd." -> "Boon Siew Honda Sdn Bhd"
--      "Full Stack Engineer"       -> "Full-Stack Engineer"
--        (spelling choice: "Full-Stack" for both the job title and
--        the existing skill "Full-Stack Development")
--      Experience date ranges are rendered with an en dash in code;
--      education year strings already use an en dash and are unchanged.
--
-- Step 1 — backup (read-only). Save the output before applying:
--   cd <checkout>
--   ./node_modules/.bin/wrangler d1 execute gy-portfolio-db --remote --json \
--     --command "SELECT id, updated_at, content FROM portfolio_profile;" \
--     > /workspace/eng-org/pending/gy-portfolio-db-portfolio_profile.backup.json
--
-- Step 2 — apply (ONLY after explicit user approval):
--   ./node_modules/.bin/wrangler d1 execute gy-portfolio-db --remote --file scripts/pending-d1-resume-typography.sql
--
-- Optional local preview (does not touch remote):
--   ./node_modules/.bin/wrangler d1 execute gy-portfolio-db --local --file scripts/pending-d1-resume-typography.sql
--
-- The deploy of the Worker is separate:
--   npm run deploy
--   (that is: vinext build && wrangler deploy)
-- Do not run either command in this change cycle.

INSERT INTO portfolio_profile (id, content, updated_at)
VALUES (
  'default',
  '{"name":"Lee Guang You","initials":"GY","avatar":"/profile/avatar-linkedin.png","title":"Software Engineer","subtitle":"Connecting software, hardware and business operations.","location":"Simpang Ampat, Penang, Malaysia","availability":"Open to opportunities","focus":"System Integration · Automation · Smart Metering","email":"guangyou7953@outlook.com","bio":"I build web and desktop applications, connect software with hardware, and automate business workflows — from smart metering and industrial systems to payments and e-Invoicing.","summary":"I’m a technology enthusiast with a passion for software development, system integration, and automation.\n\nMy experience spans smart metering solutions, industrial production machines, and web application development. I’ve worked on integrating PayNet DuitNow payment services and LHDN MyInvois e-Invoicing systems, bridging software with real-world business operations.\n\nOne of my memorable experiences was contributing to Singapore’s National Day Parade (NDP), supporting power monitoring through smart metering technology.\n\nI enjoy solving technical challenges, exploring new technologies, and finding smarter ways to connect software, hardware, and automation.\n\nI’m always looking to learn, improve, and take on new challenges that create meaningful impact.","values":[],"socials":{"github":"https://github.com/guangyou0716","linkedin":"https://www.linkedin.com/in/lee-guang-you-729a12aa","email":"mailto:guangyou7953@outlook.com"},"experience":[{"company":"Bioenergy Projects Sdn Bhd","role":"Software Engineer","location":"Perai, Penang, Malaysia","type":"Full-time · On-site","startDate":"Mar 2024","endDate":"Present","bullets":["Develop and maintain PHP-based web applications to support business operations.","Contribute to PayNet DuitNow payment and LHDN MyInvois e-Invoicing API integrations.","Support smart meter power monitoring and data collection, including operations for Singapore’s National Day Parade (NDP).","Support industrial production machines through software and hardware integration and automation."]},{"company":"Kaifa Technology Malaysia","role":"MES Assistant Engineer","location":"Bukit Mertajam, Penang, Malaysia","type":"Full-time · On-site","startDate":"Dec 2023","endDate":"Jan 2024","bullets":["Assisted with troubleshooting production machines in collaboration with software engineers in China."]},{"company":"Lingkail Sdn Bhd","role":"Full-Stack Engineer","location":"Bukit Mertajam, Penang, Malaysia","type":"Full-time · On-site","startDate":"Sep 2022","endDate":"Dec 2023","bullets":["Developed websites and web pages using .NET."]},{"company":"Boon Siew Honda Sdn Bhd","role":"Information Technology Trainee","location":"Simpang Ampat, Penang, Malaysia","type":"Internship · On-site","startDate":"Dec 2019","endDate":"Feb 2020","bullets":[]}],"skillGroups":[{"label":"Languages & web","items":["PHP","C#","Python","HTML","CSS"]},{"label":"Frameworks & UI","items":[".NET Framework",".NET Avalonia UI","ASP.NET","Bootstrap","Flutter","MudBlazor",".NET MAUI",".NET Blazor","MVVM"]},{"label":"Databases","items":["PostgreSQL","MySQL","SQLite","InfluxDB","Microsoft SQL Server"]},{"label":"Systems & protocols","items":["Smart Metering","DLMS","MQTT","M-Bus","Modbus","TCP","IEC","Computer Networking"]},{"label":"Business integration","items":["PayNet DuitNow","LHDN MyInvois / MyTax","Full-Stack Development"]},{"label":"AI & automation","items":["AI Agents","Agentic Workflows"]},{"label":"Tools & deployment","items":["Grafana","Docker","WiX Toolset","SQL Server Management Studio","Visual Studio"]}],"education":[{"qualification":"Bachelor’s degree (CGPA 3.72)","school":"Wawasan Open University (WOU)","field":"Computer Software Engineering","year":"Sep 2021 – Mar 2026","coursework":""},{"qualification":"Diploma of Education (CGPA 3.60)","school":"Synergy College","field":"Network and System Administration/Administrator","year":"Jan 2018 – Mar 2021","coursework":""},{"qualification":"SPM (1A, 7B, 1C, 1D)","school":"SMK Taman Perwira","field":"","year":"2013 – 2017","coursework":""}],"githubCovers":{}}',
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
)
ON CONFLICT(id) DO UPDATE SET
  content = excluded.content,
  updated_at = excluded.updated_at;
