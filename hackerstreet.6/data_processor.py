import pandas as pd
import numpy as np
from datetime import datetime

class DebtDataProcessor:
    def __init__(self, data_path):
        self.data = pd.read_csv(data_path)
        self.countries = self.data['Country'].unique()
        self.years = sorted(self.data['Year'].unique())
        
    def get_country_debt(self, country, year=None):
        """Get debt data for a specific country"""
        if year:
            mask = (self.data['Country'] == country) & (self.data['Year'] == year)
        else:
            mask = self.data['Country'] == country
            year = self.years[-1]  # Latest year
            
        country_data = self.data[mask]
        if country_data.empty:
            return None
            
        latest = country_data.iloc[-1]
        return {
            'country': country,
            'year': year,
            'debt_to_gdp': latest['Debt-to-GDP Ratio'],
            'total_debt': latest['Total Debt (USD)'],
            'trend': self._calculate_trend(country)
        }
    
    def get_top_countries(self, metric='debt_to_gdp', n=5, highest=True):
        """Get top N countries by debt metric"""
        latest_year = self.years[-1]
        latest_data = self.data[self.data['Year'] == latest_year]
        
        if metric == 'debt_to_gdp':
            sorted_data = latest_data.sort_values('Debt-to-GDP Ratio', ascending=not highest)
        else:
            sorted_data = latest_data.sort_values('Total Debt (USD)', ascending=not highest)
            
        return sorted_data.head(n)[['Country', 'Debt-to-GDP Ratio', 'Total Debt (USD)']]
    
    def get_global_average(self, year=None):
        """Calculate global average debt metrics"""
        if year:
            mask = self.data['Year'] == year
        else:
            year = self.years[-1]
            mask = self.data['Year'] == year
            
        year_data = self.data[mask]
        return {
            'year': year,
            'avg_debt_to_gdp': year_data['Debt-to-GDP Ratio'].mean(),
            'total_global_debt': year_data['Total Debt (USD)'].sum()
        }
    
    def get_debt_trend(self, country):
        """Calculate debt trend for a country"""
        country_data = self.data[self.data['Country'] == country]
        if len(country_data) < 2:
            return "Insufficient data"
            
        latest_ratio = country_data.iloc[-1]['Debt-to-GDP Ratio']
        previous_ratio = country_data.iloc[-2]['Debt-to-GDP Ratio']
        
        if latest_ratio > previous_ratio:
            return "Increasing"
        elif latest_ratio < previous_ratio:
            return "Decreasing"
        else:
            return "Stable"
    
    def _calculate_trend(self, country):
        """Calculate trend based on multiple years of data"""
        country_data = self.data[self.data['Country'] == country]
        if len(country_data) < 3:
            return "Insufficient data"
            
        ratios = country_data['Debt-to-GDP Ratio'].values
        if all(ratios[i] <= ratios[i+1] for i in range(len(ratios)-1)):
            return "Increasing"
        elif all(ratios[i] >= ratios[i+1] for i in range(len(ratios)-1)):
            return "Decreasing"
        else:
            return "Fluctuating"
    
    def get_comparison(self, countries, metric='debt_to_gdp'):
        """Compare debt metrics between countries"""
        latest_year = self.years[-1]
        comparison = []
        
        for country in countries:
            data = self.get_country_debt(country, latest_year)
            if data:
                comparison.append({
                    'country': country,
                    'debt_to_gdp': data['debt_to_gdp'],
                    'total_debt': data['total_debt'],
                    'trend': data['trend']
                })
                
        return comparison
    
    def get_historical_data(self, country, start_year=None, end_year=None):
        """Get historical debt data for a country"""
        mask = self.data['Country'] == country
        if start_year:
            mask &= self.data['Year'] >= start_year
        if end_year:
            mask &= self.data['Year'] <= end_year
            
        return self.data[mask][['Year', 'Debt-to-GDP Ratio', 'Total Debt (USD)']] 