package frc.robot.subsystems;

import edu.wpi.first.networktables.*;
import edu.wpi.first.wpilibj.Timer;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class TeleopDashboardSubsystem extends SubsystemBase {
  
  private BooleanSubscriber _elevatorUpSub;
  private StringSubscriber _intakeSub;
  private StringSubscriber _sourceLaneSub;
  private StringSubscriber _ledSelectionSub;
  private StringSubscriber _levelSelectionSub;
  private StringSubscriber _sideSelectionSub;
  private BooleanSubscriber _scoreCoralSub;
  private BooleanSubscriber _resetGyroSub;
  private BooleanSubscriber _neutralElevatorSub;
  private BooleanSubscriber _zeroElevatorSub;

  private BooleanEntry _elevatorUpPub;
  private StringEntry _intakePub;
  private StringEntry _sourceLanePub;
  private StringEntry _ledSelectionPub;
  private StringEntry _levelSelectionPub;
  private StringEntry _sideSelectionPub;
  private BooleanEntry _scoreCoralPub;
  private BooleanEntry _resetGyroPub;
  private BooleanEntry _neutralElevatorPub;
  private BooleanEntry _zeroElevatorPub;

  private double _elevatorSubLastChange = 0;
  private double _intakeSubLastChange = 0;
  private double _sourceSubLastChange = 0;
  private double _ledSelectionSubLastChange = 0;
  private double _levelSelectionSubLastChange = 0;
  private double _sideSelectionSubLastChange = 0;
  private double _scoreCoralSubLastChange = 0;
  private double _resetGyroSubLastChange = 0;
  private double _neutralElevatorSubLastChange = 0;
  private double _zeroElevatorSubLastChange = 0;

  private Timer _lockTimer = new Timer();

  public TeleopDashboardSubsystem(){

    var teleopTable = ReactDashSubsystem.ReactDash.getSubTable("Teleop");

    _elevatorUpSub = teleopTable.getBooleanTopic("dpub/raiseElevator").subscribe(false);
    _intakeSub = teleopTable.getStringTopic("dpub/selectedIntakeType").subscribe("manual");
    _sourceLaneSub = teleopTable.getStringTopic("dpub/selectedSourceLane").subscribe("center");
    _ledSelectionSub = teleopTable.getStringTopic("dpub/ledStatusSelection").subscribe("None");
    _levelSelectionSub = teleopTable.getStringTopic("dpub/levelSelection").subscribe("4");
    _sideSelectionSub = teleopTable.getStringTopic("dpub/sideSelection").subscribe("R");
    _scoreCoralSub = teleopTable.getBooleanTopic("dpub/scoreCoral").subscribe(false);
    _resetGyroSub = teleopTable.getBooleanTopic("dpub/resetGyro").subscribe(false);
    _neutralElevatorSub = teleopTable.getBooleanTopic("dpub/neutralElevator").subscribe(false);
    _zeroElevatorSub = teleopTable.getBooleanTopic("dpub/zeroElevator").subscribe(false);

    /* 
    _elevatorUpPub = teleopTable.getBooleanTopic("dpub/elevatorUp").getEntry(false);
    _intakePub = teleopTable.getStringTopic("dpub/selectedIntakeType").getEntry("manual");
    _sourceLanePub = teleopTable.getStringTopic("dpub/selectedSourceLane").getEntry("None");
    _ledSelectionPub = teleopTable.getStringTopic("dpub/ledSelection").getEntry("None");
    _levelSelectionPub = teleopTable.getStringTopic("dpub/levelSelection").getEntry("4");
    _sideSelectionPub = teleopTable.getStringTopic("dpub/sideSelection").getEntry("R");
    _resetGyroPub = teleopTable.getBooleanTopic("dpub/resetGyro").getEntry(false);
    _neutralElevatorPub = teleopTable.getBooleanTopic("dpub/neutralElevator").getEntry(false);
    _zeroElevatorPub = teleopTable.getBooleanTopic("dpub/zeroElevator").getEntry(false);
    */
    _lockTimer.start();

  }

  public void periodic() {
    if (_lockTimer.get() > .5) {
      // ReactConstants._intakeType = _intakeSub.get();
      // ReactConstants._coralStationLane = _sourceLaneSub.get();
      // ReactConstants._ledSelection = _ledSelectionSub.get();

      SmartDashboard.putString("Coral Lane Station", _sourceLaneSub.get());
      // SmartDashboard.putString("LED Selection", ReactConstants._ledSelection);
      SmartDashboard.putBoolean("Gyro Reset", _resetGyroSub.get());

      // ReactConstants._levelSelection = _levelSelectionSub.get();
      // ReactConstants._sideSelection = _sideSelectionSub.get();

      // ReactConstants._scoreCoral = _scoreCoralSub.get();
      // ReactConstants._resetGyro = _resetGyroSub.get();
      // ReactConstants._neutralElevator = _neutralElevatorSub.get();
      // ReactConstants._zeroElevator = _zeroElevatorSub.get();
    }
  }

  public void checkForFlagsString(StringSubscriber subscriber, String flag, double storedLastChange) {
    double lastChange = subscriber.getLastChange();
    if (lastChange > storedLastChange) {
      
      // LED Select Flag
      if (flag.equals("ledSelection")) {
        // ReactConstants._changeLEDflag = true;
        _ledSelectionSubLastChange = lastChange;
      }
    }
  }
}
