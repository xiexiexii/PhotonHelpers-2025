package frc.robot;

import com.ctre.phoenix6.configs.CANrangeConfiguration;
import com.ctre.phoenix6.signals.UpdateModeValue;
import com.revrobotics.spark.config.SparkFlexConfig;
import com.revrobotics.spark.config.SparkMaxConfig;
import com.revrobotics.spark.config.ClosedLoopConfig.FeedbackSensor;
import com.revrobotics.spark.config.SparkBaseConfig.IdleMode;

import frc.robot.Constants.ModuleConstants;

public final class Configs {
  public static final class MAXSwerveModule {
    public static final SparkFlexConfig drivingConfig = new SparkFlexConfig();
    public static final SparkMaxConfig turningConfig = new SparkMaxConfig();

    static {
      // Use module constants to calculate conversion factors and feed forward gain.
      double drivingFactor = ModuleConstants.kWheelDiameterMeters * Math.PI
        / ModuleConstants.kDrivingMotorReduction;
      double turningFactor = 2 * Math.PI;
      double drivingVelocityFeedForward = 1 / ModuleConstants.kDriveWheelFreeSpeedRps;

      drivingConfig
        .idleMode(IdleMode.kBrake)
        .smartCurrentLimit(50);
      drivingConfig.encoder
        .positionConversionFactor(drivingFactor) // meters
        .velocityConversionFactor(drivingFactor / 60.0); // meters per second
      drivingConfig.closedLoop
        .feedbackSensor(FeedbackSensor.kPrimaryEncoder)
        // These are example gains you may need to them for your own robot!
        .pid(0.04, 0, 0)
        .velocityFF(drivingVelocityFeedForward)
        .outputRange(-1, 1);

      turningConfig
        .idleMode(IdleMode.kBrake)
        .smartCurrentLimit(20);
      turningConfig.absoluteEncoder
        // Invert the turning encoder, since the output shaft rotates in the opposite
        // direction of the steering motor in the MAXSwerve Module.
        .inverted(true)
        .positionConversionFactor(turningFactor) // radians
        .velocityConversionFactor(turningFactor / 60.0); // radians per second
      turningConfig.closedLoop
        .feedbackSensor(FeedbackSensor.kAbsoluteEncoder)
        // These are example gains you may need to tune them for your own robot!
        .pid(1, 0, 0)
        .outputRange(-1, 1)
        // Enable PID wrap around for the turning motor. This will allow the PID
        // controller to go through 0 to get to the setpoint i.e. going from 350 degrees
        // to 10 degrees will go through 0 rather than the other direction which is a
        // longer route.
        .positionWrappingEnabled(true)
        .positionWrappingInputRange(0, turningFactor);
    }
  }

  // Sensors 
  public static final class SensorConfigs {

    // init
    public static final CANrangeConfiguration CANRangeConfig = new CANrangeConfiguration();

    // Actual stuff to adjust
    static {
      CANRangeConfig.FutureProofConfigs = true; // Firmware incompatability safety net

      CANRangeConfig.ProximityParams.ProximityThreshold = 0.5; // How far is far enough?
      CANRangeConfig.ProximityParams.ProximityHysteresis = 0.01; // Tolerance for measurement
      CANRangeConfig.ProximityParams.MinSignalStrengthForValidMeasurement = 2500; // Signal strength req.

      CANRangeConfig.ToFParams.UpdateFrequency = 50; // How often should it measure?
      CANRangeConfig.ToFParams.UpdateMode = UpdateModeValue.ShortRange100Hz; // Measurement mode
    }
  }
}