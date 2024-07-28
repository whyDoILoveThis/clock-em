import { useState, useEffect } from 'react';
import { User, Request } from '../types/types';
import { updateUserHourlyRate, updateUserTimeTrackingPeriod, fetchEmployeeRequests, approveRequest, addEmployeeToCompany, calculateWorkHoursAndPay } from '../lib/db';

interface OwnerDashboardProps {
  owner: User;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ owner }) => {
  const [hourlyRate, setHourlyRate] = useState<number>(owner.hourlyRate || 0);
  const [timeTrackingPeriod, setTimeTrackingPeriod] = useState<number>(owner.timeTrackingPeriod || 1);
  const [requests, setRequests] = useState<Request[]>([]);
  const [workSummary, setWorkSummary] = useState<{ employee: User; totalHours: number; totalPay: number }[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      const employeeRequests = await fetchEmployeeRequests(owner._id.toString());
      setRequests(employeeRequests);
    };
    loadRequests();
  }, [owner]);

  useEffect(() => {
    const fetchWorkSummary = async () => {
      const summary = await Promise.all(owner.companies!.map(async (companyId) => {
        const employees = await fetchEmployeesInCompany(companyId); // Define this function
        return Promise.all(employees.map(async (employee) => {
          const { totalHours, totalPay } = await calculateWorkHoursAndPay(employee._id.toString(), hourlyRate);
          return { employee, totalHours, totalPay };
        }));
      }));
      setWorkSummary(summary.flat());
    };
    fetchWorkSummary();
  }, [owner, hourlyRate]);

  const handleRateChange = async () => {
    await updateUserHourlyRate(owner._id.toString(), hourlyRate);
  };

  const handlePeriodChange = async (period: number) => {
    setTimeTrackingPeriod(period);
    await updateUserTimeTrackingPeriod(owner._id.toString(), period);
  };

  const handleApprove = async (request: Request) => {
    await approveRequest(request._id.toString());
    await addEmployeeToCompany(request.employeeId, request.companyId);
    setRequests(requests.filter(r => r._id.toString() !== request._id.toString()));
  };

  return (
    <div>
      <h1>Welcome, {owner.name}</h1>
      <div>
        <label>
          Hourly Rate: $
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            onBlur={handleRateChange}
          />
        </label>
      </div>
      <div>
        <label>
          Time Tracking Period:
          <select
            value={timeTrackingPeriod}
            onChange={(e) => handlePeriodChange(Number(e.target.value))}
          >
            <option value={1}>1 Week</option>
            <option value={2}>2 Weeks</option>
          </select>
        </label>
      </div>
      <h2>Employee Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request._id.toString()}>
            {request.employeeId} wants to join {request.companyId}
            <button onClick={() => handleApprove(request)}>Approve</button>
          </li>
        ))}
      </ul>
      <h2>Work Summary</h2>
      <ul>
        {workSummary.map(({ employee, totalHours, totalPay }) => (
          <li key={employee._id.toString()}>
            {employee.name}: {totalHours} hours, ${totalPay} earned
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OwnerDashboard;
