# 📈 Manufactoring Quality Control (Back-End)
### This project was developed during my internship and supports data-driven processes by visualizing a dashboard for monitoring and controlling heat treatment products. There are five components to the dashboard.
1. Control Chart
2. Violation Summary
3. Violation Details
4. Process Capability (Cp, Cpk)
5. General Data such as The number of records, Material No., and Period
<img src="images\web_example1.png" alt="web_example" width="640"> 

----

### Tech Stack

**Front-End**  
![Flutter](https://img.shields.io/badge/Flutter-02569B?logo=flutter&logoColor=white)

**Back-End**  
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs)

**Database**  
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)



----

### System Architecture
<img src="images\system_architecture.jpg" alt="architecture" width="640"> 
<br>

    According to the system architecture, 
    this project uses data from the QC Report System,
    then maps some fields and stores them in the database.
    For visualization, the dashboard uses data from 
    the Manufacturing Quality Control database.
    In summary, the QC Report System is used to import 
    new data and retrieve data from the database.

----

### Problem
- Engineers manually create control chart and process capability analyses using Excel, which is very time-consuming.
- When changing data, like from 1 month to 3 months, or material A to material A-1, you must create it again.
- Everyone can't access the dashboard because it is paper-based.

### Solution
- It mapped and calculated values for control charts and process capability, and identified points that violated the rules.
- You just only send query parameters (period, furnace No., and material No.) for getting data for visualization.
- It deploys on a local server; everybody can access it.

### Impact
- **Reduce** time to create control chart **from hours to week in just 30 second** and not depend on a number of data
- It can integrate with QC Report System that use in organization.
- Support data-driven in organization and Industry 4.0.

----
#### 😿 Disclosure
    Due to company copyright and confidentiality from my internship,
    I cannot share the database schema or run the real dashboard here.

<br>

**GO TO**  [<ins>Front-End repository</ins>](https:/github.com/BestBodin03/control_chart_backend)
