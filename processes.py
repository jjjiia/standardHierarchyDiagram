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
    "nation",
    "regions",
    "ZIP_Code_Tabulation_Areas",
    "divisions",
    "urban_areas",

    "school_districts",
    "states",
    "state_legislative_districts",
    "counties",
    "places",
    "county_subdivisions",
    "census_tracts",
    "subminor_civil_divisions",
    "block_groups"#,
# "state_legislative_districts_upper",
]


def simplifyFile(inputfile):

    with open("data/"+inputfile+".csv","r") as csvFile:
        csvReader = csv.reader(csvFile)
        with open("s_"+inputfile+".csv","w")as outfile:
            csvWriter = csv.writer(outfile)
            for row in csvReader:
                header = row
                fipsKey = "Geo_FIPS"
                populationKey = "SE_A00001_001"
                areaKey = "SE_A00003_001"
                nameKey = "Geo_QName"
                nameIndex = header.index(nameKey)
                fipsIndex = header.index(fipsKey)
                populationIndex = header.index(populationKey)
                areaIndex = header.index(areaKey)
                csvWriter.writerow(["fips","name","population","area"])
                break
            for row in csvReader:
                csvWriter.writerow([row[fipsIndex],row[nameIndex],row[populationIndex],row[areaIndex]])
                

# for f in files:
#     print f
#     simplifyFile(f)



def histo(inputfile,interval,csvWriter,minMax):
    print inputfile

    with open("data/"+inputfile+".csv","r") as csvFile:
        csvReader = csv.reader(csvFile)
        for row in csvReader:
            header = row
            populationKey = "SE_A00001_001"
            areaKey = "SE_A00003_001"
            populationIndex = header.index(populationKey)
            areaIndex = header.index(areaKey)
            fipsKey = "Geo_FIPS"
            fipsIndex = header.index(fipsKey)
            break
        bins = {}
        for row in csvReader:
            pop = float(row[populationIndex])
            binNumber = "_"+str(math.floor(pop/interval))
            gid = row[0]
            if binNumber in bins.keys():
                bins[binNumber].append(gid)
            else:
                bins[binNumber]=[]
                bins[binNumber].append(gid)
        #print(bins)
    binsList = []
    for b in bins:
        binsList.append([b, len(bins[b])])
    binsList.sort(key=lambda x: float(x[0].replace("_","")))
    #print binsList
   # print interval
    print len(binsList)
    csvWriter.writerow([inputfile,interval,minMax[0],minMax[1],binsList])

def maxMinCount(inputfile,outputWriter):
    #print inputfile
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
        minPop = 9999999999999999
        maxPop = 0        #
        # minArea = 10^30
        # maxArea = 0
        
        minPopName = row[1]
        maxPopName = row[1]        #
        # minAreaName = row[1]
        # maxAreaName = row[1]
        #
        # minAreaRow = row
        minPopRow = row
        
        
        maxPopulationName = row[1]
        minPopulationName = row[1]
        
        count = 0
        for row in csvReader:
            areaName = row[1]
            count+=1
            # if row[populationIndex]=="":
  #               print(row)
  #               pop = 0
  #           else:
            pop = int(row[populationIndex])
                        #
            # if row[areaIndex]=="":
            #     area = 0
            # else:
            #     area = float(row[areaIndex])
                 #
            # if area>maxArea:
            #     maxArea = area
            #     maxAreaName = row[1]
            #
            # if area<minArea and area>0 and  minAreaName !="Geo_QName":
            #     minArea = area
            #     minAreaName = row[1]
            #     minAreaRow =row
            #
            if pop>maxPop:
                maxPop = pop
                maxPopulationName = row[1]
                
            if pop<minPop and pop>0:
                minPop = pop
                minPopulationName = row[1]
                minPopRow = row
        return [minPop, maxPop]
     #
        
# with open("maxmin.csv","w")as outfile:
#     csvWriter = csv.writer(outfile)
#     csvWriter.writerow(["geo","count","maxPop","maxPopName","minPop","minPopName"])
#     for f in files:
#     #print (f)
#         maxMinCount(f,csvWriter)
#
histoBinSize = {
    "nation":1000,
    "regions":1000,
    "ZIP_Code_Tabulation_Areas":3000,
    "divisions":1000,
    "urban_areas":50000,

    "school_districts":20000,
    "states":1000,
    "state_legislative_districts":10000,
    "counties":50000,
    
    "places":20000,
    "county_subdivisions":25000,
    
    "census_tracts":500,
    "subminor_civil_divisions":500,
    "block_groups":500#,
}
with open("histo.csv","w")as outfile:
    csvWriter = csv.writer(outfile)
    csvWriter.writerow(["geo","interval","min","max","bins"])
    for f in files:
        minMaxPop = maxMinCount(f,csvWriter)
        print(minMaxPop)
        #interval = float(minMaxPop[1])/100
        interval = histoBinSize[f]
        print interval
        histo(f,interval,csvWriter,minMaxPop)

