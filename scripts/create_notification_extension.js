const path = require('path');
const fs = require('fs');

function addBuildFile(project, path, opt, group) {
        var file;
        if (group) {
            file = project.addFile(path, group, opt);
        }
        else {
            file = project.addPluginFile(path, opt);
        }
    
        if (!file) return false;
    
        file.target = opt ? opt.target : undefined;
        file.uuid = project.generateUuid();
    
        project.addToPbxBuildFileSection(file);        // PBXBuildFile
        // this.addToPbxSourcesBuildPhase(file);       // PBXSourcesBuildPhase
        return file;
}
   

module.exports = function(context) {
	console.log("Start adding notification extension");
	const extensionName = "QSoundNotificationExtension";

	const cordova_util = context.requireCordovaModule('cordova-lib/src/cordova/util');
	const ConfigParser = context.requireCordovaModule('cordova-common').ConfigParser;
	const projectRoot = cordova_util.isCordova();
	console.log("ProjectRoot "+projectRoot);
	const xml = cordova_util.projectConfig(projectRoot)
    const cfg = new ConfigParser(xml)
    const projectName = cfg.name()
    var packageName = cfg.packageName()

	var iosPlatformPath = path.join(projectRoot, 'platforms', 'ios')
	console.log("iosPlatformPath "+iosPlatformPath);

	// make extension folder
	const qSoundNotificationFolder = path.join(iosPlatformPath, extensionName);
	console.log("qSoundNotificationFolder "+qSoundNotificationFolder);
	let isNotificationExtension = true;
	if(!fs.existsSync(qSoundNotificationFolder)) {
		fs.mkdirSync(qSoundNotificationFolder, { recursive: true })
	} else {
		isNotificationExtension = false;
	}

	const pluginIOSFolder = path.join(projectRoot,"plugins","cordova-plugin-q-sound-notification","src","ios");
	console.log("pluginIOSFolder "+pluginIOSFolder);
	const infoPlistName = "Info.plist";
	const qSoundNotificationExtensionNameH = "NotificationService.h";
	const qSoundNotificationExtensionNameM = "NotificationService.m";

	const extFiles = [
        'NotificationService.h',
        'NotificationService.m',
        `${extensionName}-Info.plist`,
    ];
   

    extFiles.forEach(function (extFile) {
        let targetFile = path.join(qSoundNotificationFolder, extFile);
        fs.createReadStream(path.join(pluginIOSFolder, extFile))
            .pipe(fs.createWriteStream(targetFile));
    });

	// // Copy source files
	// fs.createReadStream(path.join(pluginIOSFolder, infoPlistName)).pipe(fs.createWriteStream(path.join(qSoundNotificationFolder, infoPlistName)));
	// fs.createReadStream(path.join(pluginIOSFolder, qSoundNotificationExtensionNameH)).pipe(fs.createWriteStream(path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameH)));
	// fs.createReadStream(path.join(pluginIOSFolder, qSoundNotificationExtensionNameM)).pipe(fs.createWriteStream(path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameM)));
 	const xcodeProjectFilePath = path.join(iosPlatformPath, projectName+".xcodeproj","project.pbxproj");
    console.log("xcodeProjectFilePath "+xcodeProjectFilePath);

	const xcode = context.requireCordovaModule('xcode');
	let proj = new xcode.project(xcodeProjectFilePath)
	proj = proj.parseSync();

	if(isNotificationExtension) {
		console.log('Creating new PBXGroup for the extension');
		let extGroup = proj.addPbxGroup(extFiles, extensionName, extensionName);

		// Add the new PBXGroup to the CustomTemplate group. This makes the
	    // files appear in the file explorer in Xcode.
	    console.log('Adding new PBXGroup to CustomTemplate PBXGroup');
	    let groups = proj.hash.project.objects['PBXGroup'];
	    Object.keys(groups).forEach(function (key) {
	        if (groups[key].name === 'CustomTemplate') {
	            proj.addToPbxGroup(extGroup.uuid, key);
	        }
	    });

	    // Add a target for the extension
	    console.log('Adding the new target');
	    let target = proj.addTarget(extensionName, 'app_extension');
	    // Add build phases to the new target
	    console.log('Adding build phases to the new target');
	    proj.addBuildPhase([ 'NotificationService.m' ], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
	    proj.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
	    proj.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
	}
	const extName = extensionName;
	var config = proj.hash.project.objects['XCBuildConfiguration'];
		for (var ref in config) {
			if (
				config[ref].buildSettings !== undefined &&
				config[ref].buildSettings.PRODUCT_NAME !== undefined &&
				config[ref].buildSettings.PRODUCT_NAME.includes(extName)
			) {
				console.log(`entered the setting: ${config[ref].buildSettings.PRODUCT_NAME} of ${ref}`);

				// var INHERITED = '"$(inherited)"';
				// if (
				// 	!config[ref].buildSettings['FRAMEWORK_SEARCH_PATHS'] ||
				// 	config[ref].buildSettings['FRAMEWORK_SEARCH_PATHS'] === INHERITED
				// ) {
				// 	proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings['FRAMEWORK_SEARCH_PATHS'] = [
				// 		INHERITED
				// 	];
				// }

				// // Set entitlements
				// if (!swrveUtils.isEmptyString(appGroupIdentifier)) {
				// 	proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings[
				// 		'CODE_SIGN_ENTITLEMENTS'
				// 	] = `"$(PROJECT_DIR)/${extName}/Entitlements-${extName}.plist"`;
				// }

				// // Fix issues with the framework search paths, deployment target and bundle id
				// proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings['FRAMEWORK_SEARCH_PATHS'].push(
				// 	`"${swrveSDKCommonDirectory}"`
				// );
				// proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] =
				// 	'10.0';

				var currentBundleID =
					proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings['PRODUCT_BUNDLE_IDENTIFIER'];

				if (
					currentBundleID == undefined ||
					!currentBundleID.includes(`${packageName}.${extName}`)
				) {
					proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings[
						'PRODUCT_BUNDLE_IDENTIFIER'
					] = `${packageName}.${extName}`;
				}

				// // ensure code signing identity is pointed correctly
				// proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings[
				// 	'CODE_SIGN_IDENTITY'
				// ] = `"iPhone Distribution"`;

				// proj.hash.project.objects['XCBuildConfiguration'][ref].buildSettings['PRODUCT_NAME'] = `${extName}`;
			}
		}
    console.log('Write the changes to the iOS project file');
    fs.writeFileSync(xcodeProjectFilePath, proj.writeSync());
 	return;
	
	// if(isNotificationExtension) {
	// 	const target = proj.addTarget(extensionName, "app_extension");

	// 	const qSoundNotificationExtensionNameMPath = path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameM);
	// 	// proj.addSourceFile(qSoundNotificationExtensionNameMPath);

	// 	const qSoundNotificationExtensionNameHPath = path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameH);
	// 	// proj.addHeaderFile(qSoundNotificationExtensionNameHPath);

	// 	const qSoundNotificationExtensionInfoPlistPath = path.join(qSoundNotificationFolder, infoPlistName);
	// 	// proj.addResourceFile(qSoundNotificationExtensionInfoPlistPath);
		
	// 	const group = proj.addPbxGroup([
	// 		qSoundNotificationExtensionInfoPlistPath,
	// 		qSoundNotificationExtensionNameMPath,
	// 		qSoundNotificationExtensionNameHPath
	// 		], extensionName, extensionName);


	// 	let groups = proj.hash.project.objects['PBXGroup'];
	// 			Object.keys(groups).forEach(function(key) {
	// 				if (groups[key].name === 'CustomTemplate') {
	// 					proj.addToPbxGroup(group.uuid, key);
	// 				}
	// 			});

	// 	proj.addBuildPhase([ qSoundNotificationExtensionNameH ], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
	// 	proj.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
	// }

	// // const groupKey = proj.findPBXGroupKey({name:extensionName})
	// // console.log(groupKey);


	// // files = [qFastlaneUITestRef.uuid, snapshotHelperRef.uuid, darwinNotificationHelperRef.uuid];//
 // //    var uiTarget = addUITestTarget(proj,"QFastlaneUITests","QFastlaneUITests", files);

 //    const type = "com.apple.product-type.app-extension";
	// const target = proj.addTarget(extensionName, "app_extension", qSoundNotificationFolder);



	// const group = proj.addPbxGroup([
	// 		qSoundNotificationExtensionInfoPlistPath,
	// 		qSoundNotificationExtensionNameHPath,
	// 		qSoundNotificationExtensionNameMPath
	// 	], extensionName, extensionName);

// 5206C4F824106D2D0087957E /* QSoundNotificationExtension */ = {
// 			isa = PBXGroup;
// 			children = (
// 				5206C4F924106D2D0087957E /* NotificationService.h */,
// 				5206C4FA24106D2D0087957E  NotificationService.m ,
// 				5206C4FC24106D2D0087957E /* Info.plist */,
// 			);
// 			path = QSoundNotificationExtension;
// 			sourceTree = "<group>";
// 		};

	
	// // const infoPlistRef = addBuildFile(proj, path.join(qSoundNotificationFolder, infoPlistName));
	// const qSoundNotificationExtensionNameHRef = addBuildFile(proj, path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameH));
	// const qSoundNotificationExtensionNameMRef = addBuildFile(proj, path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameM));

	// const fastlaneGroup = proj.addPbxGroup([
	// 	path.join(qSoundNotificationFolder, infoPlistName),
	// 	path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameH),
 //        path.join(qSoundNotificationFolder, qSoundNotificationExtensionNameM)
 //    ],extensionName,extensionName);

 // console.log(proj.)
	// fs.writeFileSync(xcodeProjectFilePath, proj.writeSync());
 //    var groups = proj.getPBXObject("PBXGroup");
 //    var groupKey = undefined;
 //    for (key in groups) {
 //        if ('CustomTemplate' == groups[key].name) {
 //            groupKey = key
 //            var customGroup = groups[key]
 //        }
 //    }

 //    proj.addToPbxGroup(fastlaneGroup.uuid, groupKey);
 //    files = [qSoundNotificationExtensionNameHRef.uuid, qSoundNotificationExtensionNameMRef.uuid];
    // var uiTarget = addUITestTarget(proj,extensionName,extensionName, files);

    // Add to workspace
    // var workspacePath = path.join(iosPlatformPath, projectName+".xcworkspace", "xcshareddata","xcschemes",projectName+".xcscheme");
    // var workspaceContent = readXmlFile(workspacePath)





};