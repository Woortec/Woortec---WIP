'use client'

import React, { useEffect, useState } from 'react';
import withAuth from '../../../components/withAuth';
import '../../../../src/styles.css';

const Results: React.FC = () => {
  const [campaignDetails, setCampaignDetails] = useState<any>(null);

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem('campaignDetails') || '{}');
    setCampaignDetails(details);
  }, []);

  if (!campaignDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Campaign Results</h1>
      <table>
        <thead>
          <tr>
            <th>Meta Ads</th>
            <th>Level 1</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Years Week</td>
            <td>W30</td>
            <td>W31</td>
            <td>W32</td>
            <td>W33</td>
            <td>W34</td>
            <td>W35</td>
          </tr>
          <tr>
            <td>Starting Day</td>
            <td>2024-07-21</td>
            <td>2024-07-28</td>
            <td>2024-08-04</td>
            <td>2024-08-11</td>
            <td>2024-08-18</td>
            <td>2024-08-25</td>
          </tr>
          <tr>
            <td>Plans Week</td>
            <td>W1</td>
            <td>W2</td>
            <td>W3</td>
            <td>W4</td>
            <td>W5</td>
            <td>W6</td>
          </tr>
          <tr>
            <td>Invest</td>
            <td>$25.00</td>
            <td>$37.50</td>
            <td>$37.50</td>
            <td>$50.00</td>
            <td>$50.00</td>
            <td>$50.00</td>
          </tr>
          <tr>
            <td>N° Ads</td>
            <td>3</td>
            <td>4</td>
            <td>4</td>
            <td>5</td>
            <td>5</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Daily Budget/Ad</td>
            <td>$1.19</td>
            <td>$1.34</td>
            <td>$1.34</td>
            <td>$1.43</td>
            <td>$1.43</td>
            <td>$1.43</td>
          </tr>
          <tr>
            <td>Calculated Increase</td>
            <td>0.00%</td>
            <td>50.00%</td>
            <td>0.00%</td>
            <td>33.33%</td>
            <td>0.00%</td>
            <td>0.00%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default withAuth(Results);
