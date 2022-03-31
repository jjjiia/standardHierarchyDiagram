# from shapely.geometry import shape
# from shapely.geometry import Polygon
# from shapely.geometry import MultiPolygon
import json
#import fiona 
import csv
import math
from operator import itemgetter
#
# dataDictionary = {"SE_T002_001":"Total Population",
#             "SE_T002_002":"Population Density (per sq. mile)",
#             "SE_T002_006":"Area (Land)"}
#
# dataDicionaryZipcode =  {"SE_A00001_001":"Total Population",
#             "SE_A00002_002":"Population Density (per sq. mile)",
#             "SE_A00002_003":"Area (Land)"}
#layers = ["counties","tracts","blockGroups","blocks"]
layers = ["zipcodes"]

dataDictionary = {"SE_A00001_001":"Total Population",
      "SE_A00003_001":"Area Total",
      "SE_A00003_002":"Area Total: Area (Land)",
      "SE_A00003_003":"Area Total: Area (Water)"}


files = [
    "school_districts",
    "states",
    "block_groups",
"census_tracts",
"county_subdivisions",
"counties",
"divisions",
"nation",
"places",
"regions",
"state_legislative_districts_lower",
"state_legislative_districts_upper",
"subminor_civil_divisions",
"urban_areas",
"ZIP_Code_Tabulation_Areas"]

def maxMinCount(inputfile,outputWriter):
    print inputfile
    with open("data/"+inputfile+".csv","r") as csvFile:
        csvReader = csv.reader(csvFile)
        for row in csvReader:
           # print(row)
            header = row
            populationKey = "SE_A00001_001"
            areaKey = "SE_A00003_001"
            populationIndex = header.index(populationKey)
            areaIndex = header.index(areaKey)
            fipsKey = "Geo_FIPS"
            fipsIndex = header.index(fipsKey)
            break
        minPop = 10^30
        maxPop = 0
        minArea = 10^30
        maxArea = 0
        
        maxAreaName = row[1]
        minAreaName = row[1]
        minAreaRow = row
        
        
        maxPopulationName = row[1]
        minPopulationName = row[1]
        
        count = 0
        for row in csvReader:
            count+=1
            if row[populationIndex]=="":
                pop = 0
            else:
                pop = float(row[populationIndex])
            
            if row[areaIndex]=="":
                area = 0
            else:
                area = float(row[areaIndex])
            
            if area>maxArea:
                maxArea = area
                maxAreaName = row[1]
                
            if area<minArea and area>0:
                minArea = area
                minAreaName = row[1]
                minAreaRow =row
                
            if pop>maxPop:
                maxPop = pop
                maxPopulationName = row[1]
                
            if pop<minPop and pop>0:
                minPop = pop
                minPopulationName = row[1]
                
        outputWriter.writerow([inputfile,count,maxPop,maxPopulationName,minPop,minPopulationName,round(maxArea,5),maxAreaName,round(minArea,5),minAreaName])
        # print("max Population",maxPop,maxPopulationName,"min Population",minPop, minPopulationName)
#         print("max Area",round(maxArea,5),maxAreaName,"min Area",round(minArea,5),minAreaName)
#         #print(minAreaRow)
        print([inputfile,count,maxPop,maxPopulationName,minPop,minPopulationName,round(maxArea,5),maxAreaName,round(minArea,5),minAreaName])
        
with open("maxmin.csv","w")as outfile:
       csvWriter = csv.writer(outfile)
       csvWriter.writerow(["geo","count","maxPop","maxPopName","minPop","minPopName","maxArea","maxAreaName","minArea","minAreaName"])
        
       for f in files:
            #print (f)
            maxMinCount(f,csvWriter)
