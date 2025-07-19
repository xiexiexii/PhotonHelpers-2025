package frc.robot.subsystems;

import com.ctre.phoenix6.hardware.CANrange;

import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.SubsystemBase;
import frc.robot.Configs.SensorConfigs;
import frc.robot.Constants.SensorConstants;

// CANRange Testing Stuff 
public class CANRangeSubsystem extends SubsystemBase {

	// Define
	CANrange m_CANRange;

	public CANRangeSubsystem(){
		m_CANRange = new CANrange(SensorConstants.k_CANRangeID);
		
		m_CANRange.getConfigurator().apply(SensorConfigs.CANRangeConfig);
	}

	public void periodic(){
		SmartDashboard.putNumber("Sensors/CANRange/Distance", m_CANRange.getDistance().getValueAsDouble());
		SmartDashboard.putNumber("Sensors/CANRange/Signal Strength", m_CANRange.getSignalStrength().getValueAsDouble());
	}

	public double getDistance() {
		return m_CANRange.getDistance().getValueAsDouble();
	}

	public double getSignalStrength() {
		return m_CANRange.getSignalStrength().getValueAsDouble();
	}
}