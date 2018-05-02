/*RESPUESTA AL CASO UNO*/
SELECT `user_role`.`cd_role_type` AS `User Type`, 
	SUM(
		CASE WHEN 
			(`user_role`.`id_user` > 0) AND (`user_role`.`in_status` = 1)
		THEN 1 ELSE 0 END) AS `Total Active Users`,
	SUM(
		CASE WHEN 
			(`user_role`.`id_user` > 0) AND (`user_role`.`in_status` = 1) 
			AND (`user_profile`.`nm_mmidle` = "") THEN 1 ELSE 0 END) AS `No Middle Name`
FROM `user_role`, `user_profile` WHERE `user_role`.`id_user` = `user_profile`.`id_user` GROUP by `user_role`.`cd_role_type`

/*RESPUESTA AL SEGUNDO CASO*/
SELECT
	SUM(
		CASE WHEN 
			(`user_address`.`id_user` = `user_role`.`id_user`)
			AND (`user_address`.`id_address` != "")
			AND (`user_role`.`id_user` > 0)
	        AND (`user_role`.`in_status` = 1)
	        AND ((`user_role`.`cd_role_type` = "LICENSEE") OR (`user_role`.`cd_role_type` = "LIMITED"))
	    THEN 1 ELSE 0 END
    ) AS `Active Licensees With Address Info` 
FROM `user_role`, `user_address`

/*RESPUESTA AL TERCER CASO*/
SELECT
	SUM(
		CASE WHEN 
			((`user_role`.`id_user` = 0)
	        OR (`user_role`.`in_status` != 1))
	        AND (`user_role`.`cd_role_type` = "PROVIDER")
	    THEN 1 ELSE 0 END
    ) AS `Non-active Providers`
FROM `user_role`