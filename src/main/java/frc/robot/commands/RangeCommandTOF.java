package frc.robot.commands;

import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.wpilibj.Timer;
import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.Constants.DriveConstants;
import frc.robot.Constants.VisionConstants;
import frc.robot.subsystems.CANRangeSubsystem;
import frc.robot.subsystems.Swerve.DriveSubsystem;

// Positions Robot at the Nearest Valid Target
public class RangeCommandTOF extends Command {
    
  // Instantiate Stuff
  DriveSubsystem m_swerveSubsystem;
  CANRangeSubsystem m_CANRange;

  // Timer for cancellation with failed robot adjustment
  Timer timer = new Timer();

  // PID Controller stuff (woah so many so scary) 
  PIDController m_aimController = new PIDController(VisionConstants.kP_range, VisionConstants.kI_range, VisionConstants.kD_range);

  // Target range
  private double m_rangeTarget;

  // Constructor
  public RangeCommandTOF(DriveSubsystem driveSubsystem, CANRangeSubsystem canRange, double rangeTarget) {
        
    // Definitions and setting parameters are equal to members!
    m_swerveSubsystem = driveSubsystem;
    addRequirements(driveSubsystem);
    m_CANRange = canRange;
    addRequirements(canRange);
    m_rangeTarget = rangeTarget;
  }

  // What we do to set up the command 
  public void initialize() {

    // Reset the Shoot Commit Boolean
    VisionConstants.k_positionedTOF = false;

    // Timer Reset
    timer.start();
    timer.reset();
  }
    
  // The actual control!
  public void execute() {

    VisionConstants.k_positioning = true;

    m_swerveSubsystem.drive(0, TOF_Range_PID(), 0, false);
  }

  // Add stuff we do after to reset here (a.k.a tag filters)
  public void end(boolean interrupted) {
    VisionConstants.k_positioning = false;

    if (Math.abs(m_CANRange.getDistance() - m_rangeTarget) < VisionConstants.k_aimThreshold) {
        VisionConstants.k_positionedTOF = true;
    }
  }

  // Are we done yet? Finishes when threshold is reached or if no tag in view or if timer is reached 
  public boolean isFinished() {
    return
      // Range (Distance)
      Math.abs(m_CANRange.getDistance() - m_rangeTarget) < VisionConstants.k_rangeThresholdTOF

      // Other quit conditions
      || timer.get() > 3;
  }

  // PID-assisted ranging control with CANRange Distance value from target-relative data
  private double TOF_Range_PID() {

    // Range in meters
    m_aimController.enableContinuousInput(-4, 4);
    
    // Calculates response based on difference in angle from tag to robot
    double targetingDriveVelocity = m_aimController.calculate(m_CANRange.getDistance() - m_rangeTarget);

    // Multiply by -1 to invert direction. Multiply by a reduction 
    // multiplier to reduce speed. Scale reading up with robot speed.
    targetingDriveVelocity *= -0.1 * DriveConstants.kMaxAngularSpeed;

    // Hooray
    return targetingDriveVelocity;
  }
}
