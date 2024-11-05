<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            ['label' => 'Accounting Clerk', 'value' => 'Accounting Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Manager', 'value' => 'Accounting Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Staff', 'value' => 'Accounting Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Staff II', 'value' => 'Accounting Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Supervisor', 'value' => 'Accounting Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounts Payable Supervisor', 'value' => 'Accounts Payable Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Admin Staff II', 'value' => 'Admin Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Administrative In-charge', 'value' => 'Administrative In-charge', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Administrative Officer', 'value' => 'Administrative Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Administrative Staff', 'value' => 'Administrative Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Area Credit and Collection Officer', 'value' => 'Area Credit and Collection Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Area Manager', 'value' => 'Area Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assembler', 'value' => 'Assembler', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Accounting Manager', 'value' => 'Assistant Accounting Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Automation Manager', 'value' => 'Assistant Automation Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Compliance/Audit Manager', 'value' => 'Assistant Compliance/Audit Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Marketing Manager', 'value' => 'Assistant Marketing Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Audit Supervisor', 'value' => 'Audit Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Web Developer', 'value' => 'Assistant Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Auditor', 'value' => 'Auditor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Auditor II', 'value' => 'Auditor II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Auto Electrician', 'value' => 'Auto Electrician', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Automation Staff', 'value' => 'Automation Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Automation Staff II', 'value' => 'Automation Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Automation Supervisor', 'value' => 'Automation Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Bajaj Coordinator', 'value' => 'Bajaj Coordinator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Benefit Staff II', 'value' => 'Benefit Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Bookkeeping Supervisor', 'value' => 'Bookkeeping Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Branch Manager', 'value' => 'Branch Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Branch Manager/Sales Manager', 'value' => 'Branch Manager/Sales Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Branch Supervisor', 'value' => 'Branch Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Branch Supervisor/Sales Supervisor', 'value' => 'Branch Supervisor/Sales Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Accounting Clerk', 'value' => 'Buffer Accounting Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Cashier/Accounting Clerk', 'value' => 'Buffer Cashier/Accounting Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Credit and Collection Representative', 'value' => 'Buffer Credit and Collection Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Mechanic', 'value' => 'Buffer Mechanic', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Sales Representative', 'value' => 'Buffer Sales Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Staff', 'value' => 'Buffer Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Buffer Staff (Telemarketer)', 'value' => 'Buffer Staff (Telemarketer)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cashier', 'value' => 'Cashier', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cashier At Large', 'value' => 'Cashier At Large', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cashier At Large II', 'value' => 'Cashier At Large II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cashier/Accounting Clerk', 'value' => 'Cashier/Accounting Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Chief Mechanic', 'value' => 'Chief Mechanic', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Chief Tax Officer', 'value' => 'Chief Tax Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Claims Supervisor', 'value' => 'Claims Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cluster Accounting Supervisor', 'value' => 'Cluster Accounting Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cluster Credit and Collection Supervisor', 'value' => 'Cluster Credit and Collection Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Compensation and Benefits Manager', 'value' => 'Compensation and Benefits Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Compliance Staff II', 'value' => 'Compliance Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Compliance/Audit Manager', 'value' => 'Compliance/Audit Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Construction/Evaluation Manager', 'value' => 'Construction/Evaluation Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Content Creator', 'value' => 'Content Creator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Corporate Secretary/Accountant', 'value' => 'Corporate Secretary/Accountant', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Credit and Collection Admin Supervisor', 'value' => 'Credit and Collection Admin Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Credit and Collection Manager', 'value' => 'Credit and Collection Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Credit and Collection Representative', 'value' => 'Credit and Collection Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Credit and Collection Representative At Large', 'value' => 'Credit and Collection Representative At Large', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Credit and Collection Supervisor', 'value' => 'Credit and Collection Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Customer Care Officer', 'value' => 'Customer Care Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Customer Relation Officer', 'value' => 'Customer Relation Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Draftsman', 'value' => 'Draftsman', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Draftswoman', 'value' => 'Draftswoman', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Driver', 'value' => 'Driver', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Driver/Mechanic', 'value' => 'Driver/Mechanic', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Evaluation Staff', 'value' => 'Evaluation Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Frontend Developer', 'value' => 'Frontend Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Graphic Designer', 'value' => 'Graphic Designer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Graphic Designer II', 'value' => 'Graphic Designer II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Group Junior Admin Supervisor', 'value' => 'Group Junior Admin Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Group Sales Manager', 'value' => 'Group Sales Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Group Service Manager', 'value' => 'Group Service Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Administrative Staff', 'value' => 'HR Administrative Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Administrative Staff II', 'value' => 'HR Administrative Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Administrative Supervisor', 'value' => 'HR Administrative Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Manager', 'value' => 'HR Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Recruitment Officer', 'value' => 'HR Recruitment Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Recruitment Staff', 'value' => 'HR Recruitment Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Recruitment Staff II', 'value' => 'HR Recruitment Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Recruitment Supervisor', 'value' => 'HR Recruitment Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Training and Activity Staff', 'value' => 'HR Training and Activity Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Training and Activity Staff II', 'value' => 'HR Training and Activity Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Training and Activity Supervisor', 'value' => 'HR Training and Activity Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Incentive and Consolidation Supervisor', 'value' => 'Incentive and Consolidation Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Institutional Sales Representative', 'value' => 'Institutional Sales Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Inventory Clerk', 'value' => 'Inventory Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'IT Staff', 'value' => 'IT Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'IT Staff II', 'value' => 'IT Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'IT/Automation Manager', 'value' => 'IT/Automation Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Job Controller/Quality Controller', 'value' => 'Job Controller/Quality Controller', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Junior Sales Supervisor-Outboard Marine Division', 'value' => 'Junior Sales Supervisor-Outboard Marine Division', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Leadman', 'value' => 'Leadman', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Liaison', 'value' => 'Liaison', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Liaison Supervisor', 'value' => 'Liaison Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Liaison/Sales Representative', 'value' => 'Liaison/Sales Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Logistics In-charge', 'value' => 'Logistics In-charge', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Logistics Staff', 'value' => 'Logistics Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Maintenance', 'value' => 'Maintenance', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Management Trainee', 'value' => 'Management Trainee', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Manager (Surplus Cars Division)', 'value' => 'Manager (Surplus Cars Division)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Manager At Large', 'value' => 'Manager At Large', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Managing Director', 'value' => 'Managing Director', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing and Claims Admin', 'value' => 'Marketing and Claims Admin', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Coordinator', 'value' => 'Marketing Coordinator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Coordinator II', 'value' => 'Marketing Coordinator II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Coordinator II (APP)', 'value' => 'Marketing Coordinator II (APP)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Coordinator II (TRI-WHEELS)', 'value' => 'Marketing Coordinator II (TRI-WHEELS)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Manager', 'value' => 'Marketing Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Promo Supervisor', 'value' => 'Marketing Promo Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Marketing Supervisor', 'value' => 'Marketing Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Mechanic', 'value' => 'Mechanic', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Mechanic-Cars', 'value' => 'Mechanic-Cars', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Messenger', 'value' => 'Messenger', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Mobile Casa Coordinator', 'value' => 'Mobile Casa Coordinator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Office Clerk', 'value' => 'Office Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Office Staff', 'value' => 'Office Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Officer In-charge', 'value' => 'Officer In-charge', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Painter', 'value' => 'Painter', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Parts Admin', 'value' => 'Parts Admin', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Parts Clerk', 'value' => 'Parts Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Parts Custodian', 'value' => 'Parts Custodian', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Parts Custodian Admin', 'value' => 'Parts Custodian Admin', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Payroll Administrator', 'value' => 'Payroll Administrator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Payroll Staff', 'value' => 'Payroll Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Payroll Staff II', 'value' => 'Payroll Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Price/Costing Supervisor', 'value' => 'Price/Costing Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Product Manager (Appliance)', 'value' => 'Product Manager (Appliance)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Project Engineer', 'value' => 'Project Engineer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Project Officer', 'value' => 'Project Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Project Supervisor', 'value' => 'Project Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Purchaser', 'value' => 'Purchaser', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Purchaser/Driver', 'value' => 'Purchaser/Driver', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Research and Development Staff', 'value' => 'Research and Development Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Retail Supervisor (Appliance)', 'value' => 'Retail Supervisor (Appliance)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Admin', 'value' => 'Sales Admin', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Administrative Supervisor', 'value' => 'Sales Administrative Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Administrative Supervisor (MC Section)', 'value' => 'Sales Administrative Supervisor (MC Section)', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales and Marketing Coordinator', 'value' => 'Sales and Marketing Coordinator', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales and Marketing Staff', 'value' => 'Sales and Marketing Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales and Marketing Staff II', 'value' => 'Sales and Marketing Staff II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Clerk', 'value' => 'Sales Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Executive', 'value' => 'Sales Executive', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative', 'value' => 'Sales Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative At Large', 'value' => 'Sales Representative At Large', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative/Driver', 'value' => 'Sales Representative/Driver', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative/Inventory Clerk', 'value' => 'Sales Representative/Inventory Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative/Liaison', 'value' => 'Sales Representative/Liaison', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Supervisor', 'value' => 'Sales Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Satellite Supervisor', 'value' => 'Satellite Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Senior Web Developer', 'value' => 'Senior Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Admin', 'value' => 'Service Admin', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Advisor', 'value' => 'Service Advisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Supervisor', 'value' => 'Service Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service and Spare Parts Manager', 'value' => 'Service and Spare Parts Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Junior Supervisor', 'value' => 'Service Junior Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Manager', 'value' => 'Service Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Relation Officer', 'value' => 'Service Relation Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Service Staff', 'value' => 'Service Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Social Media Jr. Supervisor', 'value' => 'Social Media Jr. Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Social Media Staff', 'value' => 'Social Media Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Social Media Supervisor', 'value' => 'Social Media Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'SP-Pricing I', 'value' => 'SP-Pricing I', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'SP-Purchasing I', 'value' => 'SP-Purchasing I', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'SP-Purchasing II', 'value' => 'SP-Purchasing II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Spare Parts Admin Supervisor', 'value' => 'Spare Parts Admin Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Spare Parts Manager', 'value' => 'Spare Parts Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Spare Parts Staff', 'value' => 'Spare Parts Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Supervisor At-large', 'value' => 'Supervisor At-large', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Supervisor Cars Division', 'value' => 'Supervisor Cars Division', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Support Staff', 'value' => 'Support Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Tax and Legal Staff', 'value' => 'Tax and Legal Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Tax and Legal Supervisor', 'value' => 'Tax and Legal Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Technician', 'value' => 'Technician', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Teller', 'value' => 'Teller', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Treasury Officer', 'value' => 'Treasury Officer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Truck Man', 'value' => 'Truck Man', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Utility', 'value' => 'Utility', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Video Editor', 'value' => 'Video Editor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Warehouse In-Charge', 'value' => 'Warehouse In-Charge', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Warehouse Man', 'value' => 'Warehouse Man', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Web Developer', 'value' => 'Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Web Developer II', 'value' => 'Web Developer II', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Welder', 'value' => 'Welder', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('positions')->insert($positions);
    }
}
