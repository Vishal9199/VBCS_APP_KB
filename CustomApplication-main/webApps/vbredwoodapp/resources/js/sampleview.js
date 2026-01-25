// CREATE OR REPLACE FORCE EDITIONABLE VIEW "DHAOL"."FS_USER_MENU_V" ("USER_NAME", "FINAL_JSON") DEFAULT COLLATION "USING_NLS_COMP" AS 
// WITH base_data AS (
//     SELECT
//         app.application_id,
//         app.application_code,
//         app.application_name,
//         app.remarks     AS app_remarks,
//         app.active_flag AS app_active_flag,
//         fun.function_code,
//         fun.function_name,
//         fun.remarks     AS fun_remarks,
//         fun.page_url,
//         fun.active_flag AS fun_active_flag,
//         mu.menu_id,
//         mu.menu_entry_id,
//         mu.prompt,
//         mu.menu_code,
//         mu.menu_name,
//         mu.sub_menu_id,
//         mu.sub_menu_code,
//         mu.sub_menu_name,
//         mu.full_access,
//         mu.allow_edit,
//         mu.allow_create,
//         mu.allow_delete,
//         mu.read_only,
//         mu.active_flag as menu_active_flag,
//         us.user_access_id,
//         us.user_id,
//         us.user_name,
//         us.role_id,
//         us.role_code,
//         us.role_name,
//         us.active_flag as user_active_flag
//     FROM
//         fs_application_t  app,
//         fs_functions_t    fun,
//         fs_menu_entries_v mu,
//         fs_user_access_v  us
//     WHERE
//             app.application_id = fun.application_id
//         AND fun.function_id = mu.function_id
//         AND us.menu_id = mu.menu_id
//         AND app.active_flag='Y'
//         AND fun.active_flag='Y'
//         AND mu.active_flag='Y'
//         AND us.active_flag='Y'
// ),
// distinct_data AS (
//     SELECT DISTINCT
//         application_id,
//         application_code,
//         application_name,
//         role_id,
//         role_code,
//         role_name,
//         menu_code,
//         menu_name,
//         menu_id,
//         menu_entry_id,
//         function_code,
//         function_name,
//         fun_remarks,
//         page_url,
//         full_access,
//         allow_edit,
//         allow_create,
//         allow_delete,
//         read_only,
//         menu_active_flag,
//         user_name
//     FROM base_data
// ),
// function_by_menu AS (
//     SELECT 
//         application_id,
//         application_code,
//         application_name,
//         role_id,
//         role_code,
//         role_name,
//         menu_code,
//         menu_name,
//         user_name,
//         MIN(menu_id) AS menu_id,
//         LISTAGG(
//             '{"function_code":"' || function_code || 
//             '","function_name":"' || function_name || 
//             '","fun_remarks":"' || REPLACE(NVL(fun_remarks, ''), '"', '\"') || 
//             '","page_url":"' || NVL(page_url, '') || 
//             '","menu_entry_id":' || menu_entry_id || 
//             ',"full_access":"' || full_access || 
//             '","allow_edit":"' || allow_edit || 
//             '","allow_create":"' || allow_create || 
//             '","allow_delete":"' || allow_delete || 
//             '","read_only":"' || read_only || 
//             '","menu_active_flag":"' || menu_active_flag || '"}', 
//             ','
//         ) WITHIN GROUP (ORDER BY function_code) AS functions_json
//     FROM distinct_data
//     GROUP BY 
//         application_id,
//         application_code,
//         application_name,
//         role_id,
//         role_code,
//         role_name,
//         menu_code,
//         menu_name,
//         user_name
// ),
// menu_by_role AS (
//     SELECT 
//         application_id,
//         application_code,
//         application_name,
//         role_id,
//         role_code,
//         role_name,
//         user_name,
//         LISTAGG(
//             '{"menu_code":"' || menu_code || 
//             '","menu_name":"' || REPLACE(NVL(menu_name, ''), '"', '\"') || 
//             '","menu_id":' || menu_id || 
//             ',"function":[' || functions_json || ']}', 
//             ','
//         ) WITHIN GROUP (ORDER BY menu_code) AS menu_json
//     FROM function_by_menu
//     GROUP BY 
//         application_id,
//         application_code,
//         application_name,
//         role_id,
//         role_code,
//         role_name,
//         user_name
// ),
// role_by_application AS (
//     SELECT 
//         application_id,
//         application_code,
//         application_name,
//         user_name,
//         LISTAGG(
//             '{"role_id":"' || role_id || 
//             '","role_code":"' || REPLACE(NVL(role_code, ''), '"', '\"') || 
//             '","role_name":"' || REPLACE(NVL(role_name, ''), '"', '\"') || 
//             '","menu":[' || menu_json || ']}', 
//             ','
//         ) WITHIN GROUP (ORDER BY role_id) AS role_json
//     FROM menu_by_role
//     GROUP BY 
//         application_id,
//         application_code,
//         application_name,
//         user_name
// )
// SELECT 
//     user_name,
//     -- Cast to JSON type to ensure proper JSON handling by ORDS
//     CAST('[' || LISTAGG(
//         '{"application_id":' || application_id || 
//         ',"application_name":"' || REPLACE(NVL(application_name, ''), '"', '\"') || 
//         '","application_code":"' || application_code || 
//         '","role":[' || role_json || ']}', 
//         ','
//     ) WITHIN GROUP (ORDER BY application_id) || ']' AS JSON) AS final_json
// FROM role_by_application
// GROUP BY user_name;

// GRANT SELECT ON "DHAOL"."FS_USER_MENU_V" TO "DHCUST";