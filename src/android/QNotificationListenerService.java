package com.qbix.sound.notification;

import android.content.Intent;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.IBinder;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import java.io.IOException;
import static android.provider.Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.DialogInterface;
import android.text.TextUtils;
import android.provider.Settings;

public class QNotificationListenerService extends NotificationListenerService {

    private MediaPlayer player;

    @Override
    public IBinder onBind(Intent intent) {
        return super.onBind(intent);
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn){
        boolean isMatch = matchNotificationCode(sbn);

        MediaPlayer mp = new MediaPlayer();
        try {
            mp.setDataSource(this, Uri.parse(""));
            mp.prepare();
        } catch (IOException e) {
            e.printStackTrace();
        }

        mp.start();
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn){
        boolean isMatch = matchNotificationCode(sbn);

    }

    private boolean matchNotificationCode(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();

       return false;
    }

    // private AlertDialog enableNotificationListenerAlertDialog;
//    private static final String ENABLED_NOTIFICATION_LISTENERS = "enabled_notification_listeners";
//    if(!isNotificationServiceEnabled()){
//        enableNotificationListenerAlertDialog = buildNotificationServiceAlertDialog();
//        enableNotificationListenerAlertDialog.show();
//    }
//
//    /**
//     * Is Notification Service Enabled.
//     * Verifies if the notification listener service is enabled.
//     * Got it from: https://github.com/kpbird/NotificationListenerService-Example/blob/master/NLSExample/src/main/java/com/kpbird/nlsexample/NLService.java
//     * @return True if enabled, false otherwise.
//     */
//    private boolean isNotificationServiceEnabled(){
//        String pkgName = getPackageName();
//        final String flat = Settings.Secure.getString(getContentResolver(),
//                ENABLED_NOTIFICATION_LISTENERS);
//        if (!TextUtils.isEmpty(flat)) {
//            final String[] names = flat.split(":");
//            for (int i = 0; i < names.length; i++) {
//                final ComponentName cn = ComponentName.unflattenFromString(names[i]);
//                if (cn != null) {
//                    if (TextUtils.equals(pkgName, cn.getPackageName())) {
//                        return true;
//                    }
//                }
//            }
//        }
//        return false;
//    }
//
//    private AlertDialog buildNotificationServiceAlertDialog(){
//        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
//        alertDialogBuilder.setTitle(R.string.notification_listener_service);
//        alertDialogBuilder.setMessage(R.string.notification_listener_service_explanation);
//        alertDialogBuilder.setPositiveButton(R.string.yes,
//                new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int id) {
//                        startActivity(new Intent(ACTION_NOTIFICATION_LISTENER_SETTINGS));
//                    }
//                });
//        alertDialogBuilder.setNegativeButton(R.string.no,
//                new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int id) {
//                        // If you choose to not enable the notification listener
//                        // the app. will not work as expected
//                    }
//                });
//        return(alertDialogBuilder.create());
//    }
}
