package frc.robot.subsystems;

import edu.wpi.first.networktables.BooleanPublisher;
import edu.wpi.first.networktables.IntegerPublisher;
import edu.wpi.first.networktables.NetworkTable;
import edu.wpi.first.networktables.NetworkTableInstance;
import edu.wpi.first.networktables.StringPublisher;
import edu.wpi.first.networktables.StringSubscriber;
import edu.wpi.first.wpilibj.DriverStation;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class ReactDashSubsystem extends SubsystemBase {

  public static final NetworkTable ReactDash = NetworkTableInstance.getDefault().getTable("ReactDash");

  public static final String AUTO_TAB_NAME = "Autonomous";
  public static final String TELEOP_TAB_NAME = "Teleop";

  private StringSubscriber _goToTabSub;

 //  private StringPublisher _goTotabPub;
  private StringPublisher _alliancePub;
  private IntegerPublisher _locationPub;
  private IntegerPublisher _matchTimePub;
  
  private BooleanPublisher _joystick0Pub;
  private BooleanPublisher _joystick1Pub;
  private BooleanPublisher _joystick2Pub;

  public ReactDashSubsystem() {

    var autoTable = ReactDashSubsystem.ReactDash.getSubTable("Main");

    _goToTabSub = autoTable.getStringTopic("/rpub/tab").subscribe("Auto");

    // _goTotabPub = autoTable.getStringTopic("rpub/goTotab").publish();
    _alliancePub = autoTable.getStringTopic("rpub/alliance").publish();
    _locationPub = autoTable.getIntegerTopic("rpub/driverStation").publish();
    _matchTimePub = autoTable.getIntegerTopic("rpub/matchTime").publish();

    _joystick0Pub = autoTable.getBooleanTopic("rpub/joystick0").publish();
    _joystick1Pub = autoTable.getBooleanTopic("rpub/joystick1").publish();
    _joystick2Pub = autoTable.getBooleanTopic("rpub/joystick2").publish();
  }

  @Override
  public void periodic() {
    _locationPub.set(DriverStation.getLocation().orElse(0));
    _alliancePub.set(DriverStation.getAlliance().get().toString());
    _matchTimePub.set((int) DriverStation.getMatchTime());
    _joystick0Pub.set(DriverStation.getJoystickIsXbox(0));
    _joystick1Pub.set(DriverStation.getJoystickIsXbox(1));
    _joystick2Pub.set(DriverStation.getJoystickIsXbox(2));
  }

  public void SwitchTab(String tab) {
    // _goTotabPub.set(tab);
  }
}
